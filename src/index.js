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
        this.inputPreview = typeof(options.inputPreview) === 'boolean' ? options.inputPreview : true
        this.onAjax = typeof(options.onAjax) === 'function' ? options.onAjax : null

        this.hint = options.hint
            ? options.hint
            : 'When autocomplete results are available, use up and down arrows to review and enter to select. Touch device users, explore by touch or with swipe gestures.'

        this.noResultsText = options.noResultsText
            ? options.noResultsText
            : 'Sorry there are no results for ::term:: please search again.'

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
        this.$input.setAttribute('aria-expanded', 'false')
        this.$input.setAttribute('aria-haspopup', 'listbox')
        this.$input.setAttribute('role', 'combobox')
        this.$input.setAttribute('aria-autocomplete', 'list')
        this.$input.setAttribute('aria-owns', `modal-${this.uid}-list`)
        this.$input.id = `flotsam-input-${this.uid}`
        this.$input.setAttribute(
            'aria-describedby',
            `assistiveHint-${this.uid}`
        )
    }

    initModal() {
        // append modal to the page
        this.$input.insertAdjacentHTML('afterend', this.generateModal())
        this.$input.insertAdjacentHTML('afterend', this.generateAssistiveHint())
        this.$input.insertAdjacentHTML('afterend', this.generateStatus())

        // grab an instance of elems to use later
        this.$modal = document.querySelector(`#modal-${this.uid}`)
        this.$status = document.querySelector(`#status-${this.uid}`)
        this.list = this.$modal.querySelector('.flotsam-modal__list')
        this.$empty = this.$modal.querySelector('.flotsam-modal__empty')

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

    ////////////////////////////////////////////////////
    // init assisitve hint
    ////////////////////////////////////////////////////

    generateAssistiveHint() {
        return `
            <div id="assistiveHint-${this.uid}" class="flotsam-modal__hint">
                ${this.hint}
            </div>
        `
    }

    generateStatus() {
        return `
            <div id="status-${this.uid}" aria-role='status' aria-live="polite" class="flotsam-modal__status">
                
            </div>
        `
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
        const str = this.noResultsText.replace('::term::', `<strong>"${this.value}"</strong>`)
        const emptyHtml = `<div>${str}</div>`
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
        this.$input.setAttribute('aria-expanded', 'true')

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
                item.classList.add('flotsam-modal__selected-item')

                // a11y features
                item.setAttribute('aria-selected', 'true')
                this.$input.setAttribute('aria-activedescendant', item.id)

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
                item.classList.remove('flotsam-modal__selected-item')
                item.setAttribute('aria-selected', 'false')
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
        this.$input.removeAttribute('aria-activedescendant')

        items.forEach((item) => {
            item.classList.remove('flotsam-modal__selected-item')
        })
    }

    generateModal() {
        return `
        <div class="flotsam-modal" id="modal-${this.uid}" >
            <div class="flotsam-modal__inner">
                <ul 
                    class="flotsam-modal__list"
                    role="listbox" 
                    id="modal-${this.uid}-list">
                </ul>
                <div class="flotsam-modal__empty" style="display: none"></div>
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
                    `<span class="flotsam-modal__list-highlight">` +
                    str +
                    '</span>'
                )
            })
            const posIndex = index + 1
            list += `
                <li class="flotsam-modal__list-item" role="option" aria-posinset="${posIndex}" aria-setsize="${this.data.length}" aria-selected="false" id="list-item-${index}--${this.uid}" tab-index="-1">
                    ${response}
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

        if (!this.data && !this.onAjax) {
            this.isDisabled = true
            console.error('flotsam: no data specified', this)
            return
        }

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
