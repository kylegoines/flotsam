import EventComponent from './EventComponent'
import './styles.css'

const OPEN_CLASS = 'is-open'

class flotsam extends EventComponent {
    ////////////////////////////////////////////////////
    // construct
    ////////////////////////////////////////////////////
    constructor(options) {
        // class inheritance setup
        // adding core events module
        super()

        // for debugging
        this.options = options

        this.$input = options.el
        this.data = options.data ? options.data : false
        this.minChars = options.minChars ? options.minChars : 2
        this.inputPreview = options.inputPreview ? options.inputPreview : true
        this.onAjax = options.onAjax

        this.isEmpty = true
        this.hasEmptyState = true

        // native state
        this.isOpen = false

        this.init()
    }

    ////////////////////////////////////////////////////
    // inits
    ////////////////////////////////////////////////////

    // setup has some housekeeping of inputs and attrs to increase quality of life
    setUp() {
        // add autocomplete off to input to not get in the way of dropdown
        this.$input.setAttribute('autocomplete', 'off')
        this.$input.setAttribute('aira-expanded', 'false')
        this.$input.setAttribute('aira-haspopup', 'listbox')
        this.$input.setAttribute('role', 'combobox')
        this.$input.setAttribute('aira-autocomplete', 'list')
        this.$input.setAttribute('aira-owns', `modal-${super.uid}-list`)
        this.$input.id = `autocomplete-input-${super.uid}`
    }

    initModal() {
        // append modal to the page
        this.$input.insertAdjacentHTML('afterend', this.generateModal())

        // grab an instance of elems to use later
        this.$modal = document.querySelector(`#modal-${super.uid}`)
        this.list = this.$modal.querySelector('.autocomplete-modal__list')
        this.$empty = this.$modal.querySelector('.autocomplete-modal__empty')

        // intial modal styles
        this.$modal.style.pointerEvents = 'none'
        this.$modal.style.visibility = 'hidden'
    }

    initInputCheck() {
        if (this.isDisabled) return

        // if we want to use ajax we build a promise to get data
        if (this.onAjax) {
            this.$input.addEventListener('input', (e) => {
                this.value = e.target.value

                if (this.minCharsExcceded()) {
                    super.dispatch('loadingData', {
                        input: this.$input,
                        modal: this.$modal,
                        flotsam: this,
                        options: this.options,
                    })
                    this.onAjax(this.value).then((result) => {
                        this.data = result

                        super.dispatch('loadedData', {
                            input: this.$input,
                            modal: this.$modal,
                            flotsam: this,
                            options: this.options,
                        })

                        this.update()
                    })
                } else if (this.isOpen) {
                    this.closeModal()
                }
            })
        } else {
            // else if we have static data lets just use that
            this.$input.addEventListener('input', (e) => {
                this.value = e.target.value
                if (this.minCharsExcceded()) {
                    this.update()
                } else if (this.isOpen) {
                    this.closeModal()
                }
            })
        }
    }

    update() {
        // filter the data
        if (this.data.length !== 0) {
            this.data = this.data.filter((item) => {
                if (item.toLowerCase().includes(this.value.toLowerCase())) {
                    return item
                }
            })
        }

        if (this.data.length === 0) {
            this.showEmptyState()
        } else {
            // we have items remove the empty state
            this.hideEmptyState()
            this.generateListItems()

            // this only triggers once then sets the modal to open state
            if (this.isOpen === false) {
                this.openModal()
            }
        }
    }

    preventSubmit(e) {
        e.preventDefault()
    }

    showEmptyState() {
        this.removeListItems()
        const emptyHtml = `<div>Sorry there are no results for <strong>"${this.value}"</strong> please search again</div>`
        this.$empty.innerHTML = emptyHtml
        this.$empty.style.display = 'block'

        if (!this.isOpen) {
            this.openModal()
        }
    }

    hideEmptyState() {
        this.$empty.innerHTML = ''
        this.$empty.style.display = 'none'
    }

    ////////////////////////////////////////////////////
    // hide and show modal
    // bread and butter functions all event setup
    // and breakdown here
    ////////////////////////////////////////////////////
    openModal() {
        if (this.isDisabled) return

        document.addEventListener('submit', this.preventSubmit)

        // this way lets us cleanly breakdown this event listener later
        this.checkKey = this.checkKey.bind(this)
        document.addEventListener('keydown', this.checkKey, true)
        this.isOpen = true

        // styles and classes
        this.$modal.style.pointerEvents = 'auto'
        this.$modal.style.visibility = 'visible'
        this.$input.classList.add(OPEN_CLASS)
        this.$input.setAttribute('aira-expanded', 'true')

        super.dispatch('openModal', {
            input: this.$input,
            modal: this.$modal,
            flotsam: this,
            options: this.options,
        })
    }

    closeModal() {
        // clean up the modal containers
        this.hideEmptyState()
        this.removeListItems()
        this.unsetSelected()

        if (this.isOpen) {
            document.removeEventListener('submit', this.preventSubmit)
            document.removeEventListener('keydown', this.checkKey, true)
        }

        this.$modal.style.pointerEvents = 'none'
        this.$modal.style.visibility = 'hidden'
        this.$input.classList.remove(OPEN_CLASS)
        this.$input.focus()

        this.isOpen = false

        super.dispatch('closeModal', {
            input: this.$input,
            modal: this.$modal,
            flotsam: this,
            options: this.options,
        })
    }
    ////////////////////////////////////////////////////
    // key event checker - the key event triggers
    ////////////////////////////////////////////////////

    checkKey(e) {
        if (e.keyCode == '38') {
            // up arrowspot
            this.selectPrev()
        } else if (e.keyCode == '40') {
            // down arrow
            this.selectNext()
        } else if (e.keyCode == '37') {
            // left arrow
        } else if (e.keyCode == '39') {
            // right arrow
        } else if (e.keyCode == '27') {
            // escape
            e.preventDefault()
            this.closeModal()
        } else if (e.keyCode == '9') {
            // tab
            e.preventDefault()
            this.closeModal()
        } else if (e.keyCode == '13') {
            // enter
            e.preventDefault()
            this.closeModal()
            this.$input.closest('form').submit()
        }
    }

    ////////////////////////////////////////////////////
    // visual selection of the items on the modal
    ////////////////////////////////////////////////////
    selectItem() {
        const items = [...this.list.querySelectorAll('li')]
        items.forEach((item, index) => {
            if (index === this.currentSelected) {
                item.classList.add('selected-item')

                // a11y features
                item.setAttribute('aira-selected', 'true')
                this.$input.setAttribute('aira-activedescendant', item.id)

                // if prevew is on show the selected in the input box
                if (this.inputPreview) {
                    this.setInput(item.innerText)
                }

                // !!EVENT!! on select key
                super.dispatch('selectKey', {
                    selected: item.textContent,
                    input: this.$input,
                    modal: this.$modal,
                    flotsam: this,
                    options: this.options,
                })
            } else {
                item.classList.remove('selected-item')
                item.setAttribute('aira-selected', 'false')
            }
        })
    }

    selectNext() {
        if (this.currentSelected === null) {
            this.currentSelected = 0
        } else {
            this.currentSelected = this.currentSelected + 1
        }

        this.selectItem()
    }

    selectPrev() {
        this.currentSelected = this.currentSelected - 1
        this.selectItem()
    }

    unsetSelected() {
        // unset selected
        this.currentSelected = null
        const items = [...this.list.querySelectorAll('li')]

        // a11y feature
        this.$input.removeAttribute('aira-activedescendant')

        items.forEach((item) => {
            item.classList.remove('selected-item')
        })
    }

    generateModal() {
        return `
        <div class="autocomplete-modal" id="modal-${super.uid}" >
            <div class="autocomplete-modal__inner">
                <ul 
                    class="autocomplete-modal__list" 
                    role="listbox" 
                    id="modal-${super.uid}-list">
                </ul>
                <div class="autocomplete-modal__empty" style="display: none"></div>
            </div>
        </div>
    `
    }

    generateListItems() {
        // clean up the dropdown of selects
        this.unsetSelected()

        let list = ``

        this.data.forEach((item, index) => {
            const regex = new RegExp(this.value, 'gi')
            const response = item.replace(regex, (str) => {
                return (
                    `<span class="autocomplete-modal__list-highlight">` +
                    str +
                    '</span>'
                )
            })
            const posIndex = index + 1
            list += `
                <li class="autocomplete-modal__list-item" role="option" aria-posinset="${posIndex}" aira-selected="false" id="list-item--${this.uid}">
                    <button tab-index="-1">
                        ${response}
                    </button>
                </li>`
        })

        // append list to the screen
        this.list.innerHTML = list

        // now that list is on DOM add event listeners
        const listItems = [...this.list.querySelectorAll('li')]
        listItems.forEach((item) => {
            item.addEventListener('click', () => {
                this.setInput(item.innerText)
                this.closeModal()
            })
        })
    }

    // quick way to breka down list
    removeListItems() {
        this.list.innerHTML = ''
    }

    ////////////////////////////////////////////////////
    // visually set input value (optionally triggered)
    ////////////////////////////////////////////////////
    setInput(textValue) {
        this.$input.value = textValue
    }

    ////////////////////////////////////////////////////
    // public triggers - USERS SHOULD ONLY USE THESE
    ////////////////////////////////////////////////////
    triggerClose() {
        this.closeModal()
    }

    triggerDisable() {
        this.isDisabled = true
        this.closeModal()
        super.dispatch('disabled', {
            input: this.$input,
            modal: this.$modal,
            flotsam: this,
            options: this.options,
        })
    }

    triggerEnable() {
        this.isDisabled = false
    }

    ////////////////////////////////////////////////////
    // utils
    ////////////////////////////////////////////////////
    minCharsExcceded() {
        if (this.value.length >= this.minChars) {
            return true
        } else {
            return false
        }
    }

    ////////////////////////////////////////////////////
    // init fn - run on singleton creation
    ////////////////////////////////////////////////////
    init() {
        this._self = this // so we can remove event listeners cleanly

        // state
        this.currentSelected = null
        this.isDisabled = false

        this.setUp()
        // inject the modal onto the page and get an instance of it
        this.initModal()

        // add listener to onInput of input
        this.initInputCheck()

        // bug not triggering right away, so set it to next cycle
        setTimeout(() => {
            super.dispatch('init', {
                input: this.$input,
                modal: this.$modal,
                flotsam: this,
                options: this.options,
            })
        }, 0)
    }
}

export default flotsam
