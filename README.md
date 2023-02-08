# Flotsam autocomplete (deprecated)

Hey! this project moved to [area 17](https://github.com/area17/flotsam), go wild there.

## Mission Statement

After looking over the choices for autocomplete libs on npm i felt that the choices for typeahead/autocomplete UI lacking one or more in the following areas:

-   vetted acessibility standards
-   simplicity, with clear documentation
-   a modern event bus system
-   flexible styling
-   doesn't jquery (im taking about you typeahead.js),
-   small footprint (<4kb)

This library in essence is porting all the good work done at on https://github.com/alphagov/accessible-autocomplete from their react component. The end result will be 100% a11y parity with https://github.com/alphagov/accessible-autocomplete :)

Any features beyond that, id be happy to include, leave an issue and some reasoning behind it.

While this library is every thing I need usually, it might not be everything you need. If you need image rendering, custom html injections in the list, need sub-sections, sub-titles ect, this isnt it. Checkout [@algolia/autocomplete-js](https://www.npmjs.com/package/@algolia/autocomplete-js) This beast will do it all.

### Why flotsom?

Have you every tried to search "autocomplete" on github or npm. Its the wild west out there

On to the docs!

---

## Using Flotsam

To initialize flotsam in a project import it in the desired file!

```
import flotsam from 'flotsam-autocomplete'
```

You'll also need some very basic styles, imported however you like to do that in your project:

```
import './node_modules/flotsam-autocomplete/dist/flotsam.css'
```

and initailize it on the page with

```
const typeahead = new flotsam({
    el: document.querySelector('input'),
    data: [!!data here!!]
})
```

Now, when interacting with the input flotsom will render an absolutely positioned box under the input
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

There are no opinionated styles on flotsom, thats up to you!

### Options

```javascript
// a complex instance of flotsam
const typeahead = new flotsam({
    // input element you want to attach to
    el: document.querySelector('input'),

    // static data formatted in an array, this is the data that will render on interaction
    data: ['lorem ipsum', 'lipsum', 'hello world', 'foo', 'bar', 'foo bar'],

    // the ajax implimentation -
    // this allows you flexablity to pass your own promise to the render function
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

    // this is an interaction that google input does that i thought i should include:
    // when key-ing up or down, the input will fill with the previewed string
    inputPreview: true,

})
```

### Events!

Flotsom comes with an event bus to trigger your own crazy ideas! When you have access to the `const typeahead` variable you can listen to events with it

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
```

### Keybaord controls

Flotsom hijacks several keys while opened to provide a holistic feature set much like the google autocomplete UI.

-   `Arrow Up` and `Arrow Down` keys allow you to select previous and next items while open
-   `Tab` will set the value, close the modal, but NOT submit (google-like)
-   `Escape` will set the value, close the modal, but NOT submit (google-like)
-   `Enter` will set the value, close the modal AND submit (google-like)

---

## API

If above was a bit too conversational for you, here are tables of the above information!
(TODO!)

## options

## Events

## Triggers

---

## Roadmap

I'm not done with this project! While the goal is to keep it lean i keep having shower ideas. Here's what's in for sure:

-   100% a11y parity with https://github.com/alphagov/accessible-autocomplete
-   Custom empty state option
-   Assistive text for screen readers (using aira-describeby)
-   Optional empty state modal
-   Outside click close (with option to disable that)

### Nice to haves

-   Custom filterBy and sortBy functions before we generate autocomplete list items
-   Custom regex for the text highlight on autocomplete (make you do all the work!)
-   Allow for custom html to be put in the dropdown (this would make some current features a bit more annoying - more docs ect)
