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
