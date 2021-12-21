import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TreeItem from "@mui/lab/TreeItem";
import { Fragment, useState } from "react";
import { HttpCodes, useMountEffect, useTimerEffect } from "../../lib/helpers";
import { PathEntry, PathEntriesResponse } from "../api/path-entries";
import styles from "../../styles/components/path-explorer.module.css";

type PathExplorerProps = {
  path: string;
};

const PathExplorer = (props: PathExplorerProps) => {
  const { path } = props;

  return (
    <Fragment key={path}>
      <p className={styles.pathLabel}>{path}</p>

      <div className={styles.treeview}>
        <PathExplorerTreeView {...props} />
      </div>
    </Fragment>
  );
};

const PathExplorerTreeView = (props: PathExplorerProps) => {
  const AutoRefreshIntervalMilliseconds = 2000;

  const { path } = props;
  let [entries, setEntries] = useState<PathEntry[]>([]);
  let unmounting = false;

  useMountEffect(() => {
    console.log("Loading tree view for:", path);

    loadTreeView();

    return () => {
      console.log("Unloading tree view for:", path);
      unmounting = true;
    };
  });

  useTimerEffect(() => {
    console.debug("Refreshing tree view for:", path);
    loadTreeView();
  }, AutoRefreshIntervalMilliseconds);

  function loadTreeView() {
    getChildrenEntriesAsync(path)
      .then(entries => {
        if (unmounting) return; // If component is unmounting then don't update the state anymore.
        setEntries(entries);
      })
      .catch(handleChildrenEntriesError);
  }

  async function loadEntryChildren(entryPath: string) {
    if (!entryPath) return; // This happens when collapsing a treeview node.

    let entry = locateEntry(entries, entryPath);
    if (!entry) {
      console.error(`"${entryPath}" was not found in the loaded entries`);
      return;
    }

    try {
      let childrenEntries = await getChildrenEntriesAsync(entry.path);
      entry.children = childrenEntries;
    } catch (error) {
      handleChildrenEntriesError(error);
      return;
    }

    setEntries(entries.slice());
  }

  //console.debug(`[Path Explorer] entries for ${path}:`, entries);

  return (
    <TreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      onNodeToggle={(ev, nodeIds) => loadEntryChildren(nodeIds[0])}
    >
      {entries.map(entry => (
        <TreeItem key={entry.path} nodeId={entry.path} label={entry.name}>
          {entry.children && <PathExplorerTreeView path={entry.path} />}
        </TreeItem>
      ))}
    </TreeView>
  );
};

async function getChildrenEntriesAsync(path: string) {
  let params = new URLSearchParams({
    path,
  });

  let response = await fetch(`/api/path-entries?${params}`, {
    method: "GET",
  });

  let responseBody = (await response.json()) as PathEntriesResponse;

  if (response.status === HttpCodes.BadRequest) {
    throw new PathExplorerError(responseBody.error);
  }

  let entries = responseBody.entries!;

  for (let entry of entries) {
    if (entry.isFolder) {
      // Add a placeholder item for folder contents to allow it to be expanded in the treeview which lazy-loads its contents.
      entry.children = [{ name: "", path: `/:/placeholder/-${entry.path}` }];
    }
  }

  return entries;
}

class PathExplorerError extends Error {}

function handleChildrenEntriesError(error: Error | unknown) {
  if (error instanceof PathExplorerError) {
    console.warn(error);
    alert(error.message);
  } else throw error;
}

function locateEntry(entries: PathEntry[], entryPath: string): PathEntry | null {
  // NOTE: This could be optimized with additional complexity to use a dictionary in the component state to avoid the recursive lookups, but this simpler approach is good enough for now as we use an isolated small instance of the PathExplorerTreeView component for each individual subfolder (primarily for performance reasons), which only tracks the immediate children entries in its state.
  for (let entry of entries) {
    if (entry.path === entryPath) {
      return entry;
    } else if (entry.children) {
      let recursiveMatch = locateEntry(entry.children, entryPath);
      if (recursiveMatch) return recursiveMatch;
    }
  }

  return null;
}

export default PathExplorer;
