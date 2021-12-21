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
  let validPath: boolean;
  let unmounting = false;

  useMountEffect(() => {
    console.log("Loading tree view for", path);

    loadTreeViewAsync()
      .then(valid => (validPath = valid!))
      .catch(e => console.error(e));

    return () => {
      console.log("Unloading tree view for", path);
      unmounting = true;
    };
  });

  useTimerEffect(() => {
    if (!validPath) return;

    console.debug("Refreshing tree view for", path);

    loadTreeViewAsync();
  }, AutoRefreshIntervalMilliseconds);

  async function loadTreeViewAsync() {
    let childrenEntries: PathEntry[];

    try {
      childrenEntries = await getChildrenEntriesAsync(path);
    } catch (error) {
      handleChildrenEntriesError(error);
      return false;
    }

    if (unmounting) return; // If component is unmounting then don't update the state anymore.

    setEntries(childrenEntries);

    return true;
  }

  async function loadEntryChildren(entryPath: string) {
    if (!entryPath) return; // This happens when collapsing a treeview node.

    // Note: Recursive lookups are not needed as this component only stores the first level of file/folders of one specific path at a time.
    let entry = entries.find(x => x.path === entryPath);

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
    alert(`ERROR: ${error.message}`);
  } else throw error;
}

export default PathExplorer;
