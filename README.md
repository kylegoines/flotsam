# Flotsam autocomplete

/ˈflätsəm/

_noun_

- the wreckage of a ship or its cargo found floating on or washed up by the sea.
- people or things that have been rejected and are regarded as worthless.
- A killer autocomplete libairy

---

## Mission Statement

After looking over the choices for autocomplete libs on npm i felt the choices for typeahead/autocomplete UI's there wasnt one simple enough with clear documentation, a modern event bus system, flexable with styles, that doesnt use jquery (im taking about you typeahead.js), with a small footprint (2kb), and still in active development. This should be able to handle solutions that need flexable ajax or static data with acessiable key controls. I kept key interactions as similar as google's typeahead as posisble.

While this libary is every thing I need usually, it might not be everything you need. If you need image rendering, custom html injections in the list, need sub sections, subtitles ect, this isnt it. Checkout [@algolia/autocomplete-js](https://www.npmjs.com/package/@algolia/autocomplete-js) This beast will do it all.

### Why flotsom?

Have you every tried to search "autocomplete" on github or npm. Its the wild west out there

On to the docs!

---

## Using Flotsam

To initialize flotsam in a project import it in the desired file!

```
import flotsam from 'flotsam-autocomplete'
```

and initailize it on the page with

```
const typeahead = new flotsam({
    el: document.querySelector('input'),
    data: [!!data here!!]
})
```

Now, when interacting with the input flotsom will render a absolutely positioned box under the input
**for best results set the parent element to relaitive position so flotsom knows where to go!**

The rendered html should look a lil' something like this

```javascript
<div class="autocomplete-modal">
  <div class="autocomplete-modal__inner">
    <ul class="autocomplete-modal__list" role="combobox">
      <li role="option">Rendered value 1</li>
      <li role="option">Rendered value 2</li>
      <li role="option">Rendered value 3</li>
      ... ect
    </ul>
  </div>
</div>
```

There are no opinionaed styles on flotsom, thats up to you!

### Options

```javascript
// a complex instance of floatsam
const typeahead = new floatsam({
    // input element oyu want to attach to
    el: document.querySelector('input'),

    // static data formatted in an array, this is the data that will render on interaction
    data: ['lorem ipsum', 'lipsum', 'hello world', 'foo', 'bar', 'foo bar'],

    // the ajax implimentation -
    // this allows oyu flexablity to pass your own promise to the render function
    // textValue is the inputed value :)
    onAjax: (textValue) => {
        return axios
            .get(`https://dummyjson.com/users/${textValue}`)
            .then((d) => {
                // after we get data we format it into an array and pass it back to flotsom THANKS!
                const users = d.data.users
                return users.map((user) => {
                    return user.firstName
                })
            })
    }

    // this sets the minimum count of input characters before we will render the box
    minChars: 2,

    // this is an interaction that google does that i thought i should include:
    // when key-ing up or down, the input will fill with the previewed word
    inputPreview: true,

})
```

### Events!

Flotsome comes with an event bus to trigger your own crazy ideas! When you have access to the `const typeahead` variable you can listen to events with it

```javascript
typeahead.on('init', (instanceData) => {
  console.log('modal init!')
})

typeahead.on('openModal', (instanceData) => {
  console.log('modal opened')
})

typeahead.on('closeModal', (instanceData) => {
  console.log('modal closed')
})

typeahead.on('selectKey', (instanceData) => {
  console.log('modal item keyed')
})

typeahead.on('disabled', (instanceData) => {
  console.log('modal item keyed')
})
```

`InstanceData` has access to the current, modal, input, options (readonly), and any other useful information i could think of!

### Triggering methods!

Flotsom also has some manual controls if you need them

```javascript
// force close the flotsom
typeahead.triggerClose()

// disables flotsom
typeahead.Triggerdisable()

// trigger event wish list
// disable, destory
```

### Keybaord controls

So these are the most important part i think! Flotsom hijacks several key and functions while opened, to provide a holistic feature set much like the google autocomplete UI.

- `Arrow Up` and `Arrow Down` keys allow you to select previous and next items while open
- `Tab` will set the value, close the modal, but NOT submit (like google)
- `Escape` will set the value, close the modal, but NOT submit (like google)
- `Enter` will set the value, close the modal AND submit (like google)

---

## API

If above was a bit too conversational for you, here are tables of the above information!

## options

## Events

## Triggers
