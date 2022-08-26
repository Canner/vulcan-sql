# Debug tools

A collection of useful tools to help us develop extensions.

## Install

1. Install package

   ```sql
   npm i @vulcan-sql/extension-debug-tools
   ```

2. Update `vulcan.yaml`

   ```yaml
   extensions:
     debug: '@vulcan-sql/extension-debug-tools'

   debug:
     # Optional: Path to store debug logs
     debug-folder: 'path-to-a-folder'
   ```

## Tools

1. AST Printer: Generate AST tree in [mermaid](https://mermaid-js.github.io/mermaid/#/) format.
   1. Build the project: `vulcan build`
   2. After building, we’ll generate AST trees in `.vulcan-debug` folder for each query. You can use some tools like **[Mermaid Live Editor](https://mermaid.live/)** to view them.
