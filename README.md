# Flotsam autocomplete

/ˈflätsəm/

_noun_

-   the wreckage of a ship or its cargo found floating on or washed up by the sea.
-   people or things that have been rejected and are regarded as worthless.
-   An a11y autocomplete library

---

## Mission Statement

We felt that the existing choices for typeahead/autocomplete UI are lacking one or more in the following areas:

-   vetted accessibility standards
-   simplicity, with clear documentation
-   a modern event bus system
-   flexible styling
-   vanilla JS with no requirement for jQuery,
-   small footprint (<4kb)

This library is inspired and aims to build upon [alphagov/accessible-autocomplete](https://github.com/alphagov/accessible-autocomplete).

---

## Using Flotsam

Firstly, install via npm:

```
$ npm install flotsam-autocomplete
```

Import into your JavaScript by:

```
import flotsam from 'flotsam-autocomplete'
```

You'll also need some very basic styles - see [Styling](#styling).

### Static setup


```JavaScript
const typeahead = new flotsam({
    // input element you want to attach to
    el: document.querySelector('input'),
    // static data formatted in an array, this is the data that will render on interaction
    data: ['lorem ipsum', 'lipsum', 'hello world', 'foo', 'bar', 'foo bar'],
});
```

**NB** currently filtering from a static list uses `[String.prototype.includes()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes)` and so looks for exact string matches - e.g. "and" will match "and", "stand", "mandatory" etc.
 
### Dynamic setup

```JavaScript
let fetchController = new AbortController();
let fetchSignal = fetchController.signal;

const typeahead = new flotsam({
    // input element you want to attach to
    el: document.querySelector('input'),

    // textValue is the input/search value 
    getData: (textValue) => {
        fetchController.abort();
        fetchController = new AbortController();
        fetchSignal = fetchController.signal;

        const url = new URL('http://fakejsonendpoints.dev.area17.com/api/autocomplete.php');
        const params = {
          q: textValue,
        };
        url.search = new URLSearchParams(params).toString();

        return fetch(
          url, 
          {
            method: 'get',
            signal: fetchSignal,
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "X-Requested-With": "XMLHttpRequest",
            }
          }
        )
        .then(response => {
          try {
            return response.json();
          } catch(error) {
            console.log('json error:', error, response);
          }
        })
        .then(data => {
          // return data arr
          return data;
        })
        .catch(error => {
          console.log('fetch error:', error);
          return [];
        });
    }
});
```

**NB** Your Ajax'd list should be filtered by your remote server, so you can allow fuzzy or exact string matches

#### Options

```JavaScript
const typeahead = new flotsam({
    el: document.querySelector('input'),
    data: [...data],

    // this sets the minimum count of input characters before we will render the box, defaults to 2
    minChars: 2,

    // when key-ing up or down, the input will fill with the previewed string
    // defaults to true
    inputPreview: true,

    // a11y instructions, defaults to:
    hint: 'When autocomplete results are available, use up and down arrows to review and enter to select. Touch device users, explore by touch or with swipe gestures.',

    // no results text, `::term::` is replaced with your search term
    noResultsText: 'Sorry there are no results for ::term:: please search again',

    // mark results in results, with `<mark>` tags, defaults to `true`
    markResults: true,

    // submit form on return key press, defaults to `true`
    submitOnReturn: true,
})
```

### Events

Flotsom triggers events on user interaction:

```JavaScript
const typeahead = new flotsam({
    el: document.querySelector('input'),
    data: [...data],
});

typeahead.addEventListener('init', instanceData => {
    // flotsam init
});

typeahead.addEventListener('openModal', (instanceData) => {
    // modal opened
});

typeahead.addEventListener('closeModal', (instanceData) => {
    // modal closed
});

typeahead.addEventListener('selectKey', (instanceData) => {
    // selected item (with keyboard)
});

typeahead.addEventListener('resultClicked', (instanceData) => {
    // result clicked/return key pressed on selected result
});

typeahead.addEventListener('loadingData', (instanceData) => {
    // loading data
});

typeahead.addEventListener('loadedData', (instanceData) => {
    // loaded
});

typeahead.addEventListener('disabled', (instanceData) => {
    // flotsam disabled
});
```

`InstanceData` has access to the current, modal, input, options (readonly), and any other useful information i could think of!

### Methods

```JavaScript
const typeahead = new flotsam({
    el: document.querySelector('input'),
    data: [...data],
});

// force close the flotsom
typeahead.triggerClose();

// enables flotsom
typeahead.triggerEnable();

// disables flotsom
typeahead.triggerDisable();
```

### Keyboard controls

Flotsom includes keyboard controls which follow the google autocomplete UI:

-   `Arrow Up` and `Arrow Down` keys allow you to select previous and next items while open
-   `Tab` will set the value, close the modal, but NOT submit (google-like)
-   `Escape` will set the value, close the modal, but NOT submit (google-like)
-   `Enter` will set the value, close the modal AND submit (google-like)

---

## Styling

The rendered HTML will look like:

```HTML
<div class="flotsam-modal">
    <div class="flotsam-modal__inner">
        <ul class="flotsam-modal__list" role="combobox">
            <li role="option" class="flotsam-modal__list-item flotsam-modal__selected-item">Rendered value 1 (selected)</li>
            <li role="option" class="flotsam-modal__list-item"><mark>Rendered value 2 (highlighted)</mark></li>
            <li role="option" class="flotsam-modal__list-item">Rendered value 3</li>
        </ul>
    </div>
</div>
<div id="assistiveHint-${this.uid}" class="flotsam-modal__hint">When autocomplete results are available, use up and down arrows to review and enter to select. Touch device users, explore by touch or with swipe gestures.</div>
<div id="status-${this.uid}" aria-role='status' aria-live="polite" class="flotsam-modal__status"></div>
```

The container of your `input` will need to have `position: relative;` in order to correctly position the dropdown.

Some default styles can be included by importing:

```
import './node_modules/flotsam-autocomplete/dist/flotsam.css'
```

These default styles come with colors set via CSS variables:

```CSS
:root {
    --flotsam-border: black;
    --flotsam-selected: pink;
    --flotsam-empty: grey;
}
```

These default styles really are basic:

```CSS
.flotsam-modal {
    position: absolute;
    width: 100%;
    top: 100%;
    border: 1px solid var(--flotsam-border, black);
}

.flotsam-modal__inner {
    padding: 0 24px;
    max-height: 200px;
    overflow: scroll;
}

.flotsam-modal__list .flotsam-modal__selected-item {
    background: var(--flotsam-selected, pink);
}

.flotsam-modal__empty {
    max-height: 200px;
    padding: 25px;
    color: var(--flotsam-empty, grey);
    font-size: 14px;
}

.flotsam-modal__hint,
.flotsam-modal__status {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
}
```

You will likely want to replace and write your own, but the imported styles will hopefully get you set up and started.

## Roadmap

-   100% a11y parity with [alphagov/accessible-autocomplete](https://github.com/alphagov/accessible-autocomplete)
-   Custom empty state option
-   Assistive text for screen readers (using `aria-describeby`)
-   Optional empty state modal
-   Outside click close (with option to disable that)
-   Keep the project small in size

### Nice to haves

-   Custom filterBy and sortBy functions before we generate autocomplete list items
-   Custom regex for the text highlight on autocomplete 

---

## Code of Conduct

AREA 17 is dedicated to building a welcoming, diverse, safe community. We expect everyone participating in the AREA 17 community to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it. Please follow it.
