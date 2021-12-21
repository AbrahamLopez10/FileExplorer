import type { NextApiRequest, NextApiResponse } from "next";

export type PathsResponse = {
  paths: string[];
};

/**
 * This API endpoint returns the list of file system path requested by the user (as command line arguments) to be explored.
 * @param req
 * @param res
 */
export default function handler(req: NextApiRequest, res: NextApiResponse<PathsResponse>) {
  let paths: string[] = [];
  let appArgumentsStarted = false;

  for (let arg of process.argv) {
    if (appArgumentsStarted) {
      if (["dev", "start"].includes(arg)) continue; // Exclude Next.js params
      if (arg === ".") continue; // Exclude current path param passed as project folder path to Next.js
      paths.push(arg);
    }

    if (arg.endsWith("/next")) {
      // The app arguments start after the "next" executable is encountered in the process arguments.
      appArgumentsStarted = true;
    }
  }

  res.json({ paths });
}
