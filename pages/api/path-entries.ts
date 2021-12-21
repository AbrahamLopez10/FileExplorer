import { readdir } from "fs/promises";
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export type PathEntry = {
  name: string;
  path: string;
  isFolder?: boolean;
  /**
   * This is populated during runtime using lazy-loading on the client-side.
   */
  children?: PathEntry[];
};

export type PathEntriesResponse = {
  entries?: PathEntry[];
  error?: string;
};

/**
 * This API endpoint returns the list of immediate children entries for a given file system path.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PathEntriesResponse>
) {
  let sourcePath = req.query.path as string;

  if (!fs.existsSync(sourcePath)) {
    res.status(400).json({ error: `The requested path (${sourcePath}) doesn't exist.` });
  }

  let entries = await getEntriesAsync(sourcePath);

  res.json({ entries } as PathEntriesResponse);
}

async function getEntriesAsync(sourcePath: string) {
  let entries: PathEntry[] = [];

  let directoryEntities = await readdir(sourcePath, { withFileTypes: true });

  for (let dirent of directoryEntities) {
    let entry: PathEntry = {
      name: dirent.name,
      path: path.resolve(sourcePath, dirent.name),
      isFolder: dirent.isDirectory(),
    };

    entries.push(entry);
  }

  return sortEntries(entries);
}

function sortEntries(entries: PathEntry[]) {
  let folders = entries.filter(x => x.isFolder);
  let files = entries.filter(x => !x.isFolder);

  return [...folders.sort(sortFunction), ...files.sort(sortFunction)];
}

function sortFunction(entry1: PathEntry, entry2: PathEntry) {
  return entry1.name.localeCompare(entry2.name);
}
