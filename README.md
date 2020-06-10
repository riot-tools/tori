# tori - Opinionated [Riot](https://riot.js.org) component generator
tori CLI tool, inspired by [hpal](https://hapipal.com)

## Installation and usage
> **Note:** tori was developed with **nodejs v12+**, it hasn't been tested in earlier versions

Recommended way:
```
npm i @graunds/tori -D
npx tori path/to/component
```

## How it works

By default `tori` will take in the whole path structure where you want to create the component. It will use **the last part of the path as the name of the component**.

Running `npx tori src/components/my-component` will generate `my-component` directory under `src/components/` with all the files defined in [the templates](./templates). Note that **you don't have to create the parent directories** as tori will recursively create them for you if they don't exist.

Tori assumes that alongside using [riot](https://riot.js.org), you will use [Jest](https://jestjs.io/) as the testing framework.

Some of the code has been commented out in the template files to make it more convenient for you to enable them.

### Customization

You can extend tori's component generation by defining paths to your desired directories in `package.json`.

**package.json example**
```
"tori": {
  "basePath": "src",             // The root of your source code. Note that the key MUST BE "basePath"
  "components": "components"     // Key defines the command you can use with tori and the value is the path based on "basePath" value
  "common": "components/common" 
},

```

Now, if you want to create a component under `src/components/common`, you can run `npx tori common my-component`.

> **Note:** the keys don't have to match the directory names: they can be anything! Just remember that they will be the commands you will use with tori, e.g. key named `x` will become `npx tori x component-name`.

## Dependencies
- [@hapi/somever](https://www.npmjs.com/package/@hapi/somever)
- [bin-v8-flags-filter](https://www.npmjs.com/package/bin-v8-flags-filter)

## TODO
- [ ] Support defining your own templates in your work directory
- [ ] More command line options for the tool?
  - e.g. `help`
  
- Something else? Let us know!
