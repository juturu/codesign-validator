# codesign-validator

Validates codesign on mac and windows files.

## `npm run` scripts

* `npm run test`: Runs tests once
* `npm run test:watch`: Runs tests in watch-mode
* `npm run lint`: Lints the code once
* `npm run lint:watch`: Lints the code in watch-mode
* `npm run cover`: Runs code coverage using `nyc` (`istanbul`)
* `npm run coveralls`: Used by coveralls
* `npm run do-publish`: Used when publishing the package.

## Getting started

```
let signValidator = require('codesign-validator').CodeSignValidator;
let signValidationInstance = new signValidator(path.join(versionDir.path(), file));
await signValidationInstance.check();
```

