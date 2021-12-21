# File Explorer

This web-based file explorer app was built using [TypeScript](https://www.typescriptlang.org/), [Next.js](https://nextjs.org/), and the [MUI 5](https://mui.com/) [Tree View component](https://mui.com/components/tree-view/).

**Author**: [Abraham Lopez](https://www.linkedin.com/in/ablopezr/) ([ablopez824@gmail.com](ablopez824@gmail.com))

## Requirements

You only need [Node.js](https://nodejs.org) version 14 or greater (may work on slightly older versions) to be installed in your system.

## Getting Started

1. First run `npm install` to install all the required dependencies.

2. To run in development mode use the following command (_be sure to not miss the `.` dot in the middle_) and replace `/path/to/folder` with the absolute or relative path to the folder you want to explore (e.g. use `~/` if you want to explore your user folder in a Linux/Mac environment):

  ```bash
  npm run dev . /path/to/folder
  ```

  > Tip: Be sure to put your folder path between double quotes if the path contains spaces.

  As a quick test, you can explore the files and folders of this project by running the following command (_be sure to include the slash at the end, otherwise the pointer to the current path will be ignored_):

  ```bash
  npm run dev . ./
  ```

  If you want to explore multiple folders just separate them with spaces, for example:

  ```bash
  npm run dev . "/path/to/folder1" "/path/to/folder2" "/path/to/folder3"
  ```

3. Then, open [http://localhost:3000](http://localhost:3000) in your web browser to use the file explorer for this folder(s).

## Run in Production

To run the file explorer in production mode please execute `npm run build` first and then use `npm start` instead of `npm run dev` as described in the previous section.

Example:

```bash
npm run build
npm start . /path/to/folder
```

## Technical Notes

### Performance Design Choices

- When the file explorer is first opened only the first level of the directory tree is loaded, while the subfolders are lazy-loaded until they're opened by the user. When a given folder in the tree view is collapsed by the user it is automatically unmounted which allows to keep the DOM as small as possible when expanding multiple folders over time.

- The file explorer component uses a recursive component tree of smaller individual tree view components which only track the first level of a single folder each one, which keeps the UI responsive by saving React from having to do a full reconciliation/diffing and re-rendering of the whole directory tree whenever the state (which contains the currently loaded file/folder structures) is updated, which is specially useful when dealing with large directory trees.

- To allow the file explorer to automatically reflect changes in the files and folders that it has loaded, a simple timer-based polling approach was chosen to frequently reload the entries of the currently opened (expanded) folders in the tree view every couple of seconds (configurable in the code of the `PathExplorerTreeView` component). When a folder is closed (collapsed) in the tree view, the timer is automatically destroyed in order to reduce the extent of polling to the minimum possible.

### Project Structure

- `pages/`: Contains the code for the user interface views (except for the `api/` subfolder, see below, follows Next.js's default project structure).
  - `pages/_app.tsx`: Entrypoint for application. Loads `pages/index.tsx` as default view.
- `pages/api/`: Contains the code for the backend API endpoints that power the UI. Uses Next.js's file-system-based routing (just like with the UI views).
- `styles/`: Contains the styles for the UI views. They're automatically namespaced by taking advantage of Next.js's support for CSS modules, so we don't have to worry about style collisions.
- `public/`: Contains UI assets (e.g. images, icons, etc.) - _not used currently_
- `lib/`: Contains local helper functions.
