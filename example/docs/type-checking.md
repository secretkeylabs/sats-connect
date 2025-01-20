# Type checking

Note that this example has been set up to use typescript project references. To typecheck each of the referenced projects, reference the project's config file, or use the `-b` (`--build`) option when using the default `tsconfig.json` to typecheck all projects:

```shell
tsc -b --noEmit                   # typechecks all projects
tsc -p tsconfig.app.json --noEmit # typecheck app
tsc --noEmit                      # won't typecheck anything, root config has no source files.
```

Given the app is the most frequently typechecked project, `package.json` includes a `ts-check` script that checks the app.
