const modal = () => {
    return `
        <div class="autocomplete-modal we active">
            <div class="autocomplete-modal__inner">
                <ul class="autocomplete-modal__list" role="combobox">
                </ul>
            </div>
        </div>
    `
}

const OPEN_CLASS = 'is-open'

// helper class to run event busing
class DispatcherEvent {
    constructor(eventName) {
        this.eventName = eventName
        this.callbacks = []
    }

    registerCallback(callback) {
        this.callbacks.push(callback)
    }

    unregisterCallback(callback) {
        const index = this.callbacks.indexOf(callback)
        if (index > -1) {
            this.callbacks.splice(index, 1)
        }
    }

    fire(data) {
        const callbacks = this.callbacks.slice(0)
        callbacks.forEach((callback) => {
            callback(data)
        })
    }
}

class floatsam {
    ////////////////////////////////////////////////////
    // construct
    ////////////////////////////////////////////////////
    constructor(options) {
        this.events = {}

        // for debugging
        this.options = options

        this.$input = options.el
        this.data = options.data ? options.data : false
        this.minChars = options.minChars ? options.minChars : 2
        this.isOpen = false
        this.isListEmpty = true
        this.isFocused = false
        this.inputPreview = true
        this.onAjax = options.onAjax
        this.init()
    }

    ////////////////////////////////////////////////////
    // event trigger and listeners
    ////////////////////////////////////////////////////
    dispatch(eventName, data) {
        const event = this.events[eventName]
        if (event) {
            event.fire(data)
        }
    }

    on(eventName, callback) {
        let event = this.events[eventName]
        if (!event) {
            event = new DispatcherEvent(eventName)
            this.events[eventName] = event
        }
        event.registerCallback(callback)
    }

    off(eventName, callback) {
        const event = this.events[eventName]
        if (event && event.callbacks.indexOf(callback) > -1) {
            event.unregisterCallback(callback)
            if (event.callbacks.length === 0) {
                delete this.events[eventName]
            }
        }
    }

    ////////////////////////////////////////////////////
    // inits
    ////////////////////////////////////////////////////

    // setup has some housekeeping of inputs and attrs to increase quality of life
    setUp() {
        // add autocomplete off to input to not get in the way of dropdown
        this.$input.setAttribute('autocomplete', 'off')
    }

    initModal() {
        // append modal to the page
        this.$input.insertAdjacentHTML('afterend', modal())

        // grab an instance of it to use later
        this.modal = document.querySelector('.autocomplete-modal')
        this.list = this.modal.querySelector('.autocomplete-modal__list')

        // intial modal styles
        this.modal.style.pointerEvents = 'none'
        this.modal.style.visibility = 'hidden'
    }

    initInputCheck() {
        // check the input

        if (this.isDisabled) return

        // if we want to use ajax we build a promise to get data
        if (this.onAjax) {
            this.$input.addEventListener('input', (e) => {
                this.value = e.target.value

                if (this.value.length >= this.minChars) {
                    this.dispatch('loadingData', {
                        input: this.$input,
                        modal: this.modal,
                        floatsam: this,
                        options: this.options,
                    })
                    this.onAjax(this.value).then((result) => {
                        this.data = result

                        this.dispatch('loadedData', {
                            input: this.$input,
                            modal: this.modal,
                            floatsam: this,
                            options: this.options,
                        })

                        this.update()
                    })
                } else {
                    this.closeModal()
                }
            })
        } else {
            this.$input.addEventListener('input', (e) => {
                this.value = e.target.value
                if (this.value.length >= this.minChars) {
                    this.update()
                }
            })
        }
    }

    update() {
        // do all data updates here

        // grab a copy of the current list so we can do some minipulation

        if (this.data) {
            console.log(this.value)
            this.generateListItems()

            // this only triggers once then sets the modal to open state
            if (this.isOpen === false) {
                this.openModal()
            }
        } else {
            this.closeModal()
        }
    }

    preventSubmit(e) {
        e.preventDefault()
    }

    ////////////////////////////////////////////////////
    // hide and show modal
    // bread and butter functions all event setup
    // and breakdown here
    ////////////////////////////////////////////////////
    openModal() {
        if (this.isDisabled) return

        document.addEventListener('submit', this.preventSubmit)
        console.log('adding keydown')
        this.checkKey = this.checkKey.bind(this)
        document.addEventListener('keydown', this.checkKey, true)

        // styles and classes
        this.modal.style.pointerEvents = 'auto'
        this.modal.style.visibility = 'visible'
        this.$input.classList.add(OPEN_CLASS)

        this.isOpen = true

        this.dispatch('openModal', {
            input: this.$input,
            modal: this.modal,
            floatsam: this,
            options: this.options,
        })
    }

    closeModal() {
        console.log('close list')
        this.list.innerHTML = ''
        this.currentSelected = null
        if (this.isOpen) {
            document.removeEventListener('submit', this.preventSubmit)
            console.log('removing keydown')
            document.removeEventListener('keydown', this.checkKey, true)
        }

        this.modal.style.pointerEvents = 'none'
        this.modal.style.visibility = 'hidden'
        this.$input.classList.remove(OPEN_CLASS)
        this.$input.focus()

        this.isOpen = false

        this.dispatch('closeModal', {
            input: this.$input,
            modal: this.modal,
            floatsam: this,
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
        console.log(this.currentSelected)
        items.forEach((item, index) => {
            if (index === this.currentSelected) {
                item.classList.add('selected-item')
                if (this.inputPreview) {
                    this.setInput(item.textContent)
                }

                // !!EVENT!! on select key
                this.dispatch('selectKey', {
                    selected: item.textContent,
                    input: this.$input,
                    modal: this.modal,
                    floatsam: this,
                    options: this.options,
                })
            } else {
                item.classList.remove('selected-item')
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

    ////////////////////////////////////////////////////
    // render function for the list
    // - runs on every data fetch
    ////////////////////////////////////////////////////
    generateListItems() {
        let list = ``

        if (!this.data) {
            console.warn('no data!!!', this.value)
            return
        }

        const filteredData = this.data.filter((item) => {
            console.log(this.value)
            if (item.toLowerCase().includes(this.value.toLowerCase())) {
                return item
            }
        })

        filteredData.forEach((item) => {
            const regex = new RegExp(this.value, 'gi')
            const response = item.replace(regex, (str) => {
                return (
                    "<span style='background-color: yellow;'>" + str + '</span>'
                )
            })
            list = list + `<li role="option">${response}</li>`
        })

        // append list to the screen
        this.list.innerHTML = list

        // now that list is on DOM add event listeners
        const listItems = [...this.list.querySelectorAll('li')]
        listItems.forEach((item) => {
            item.addEventListener('click', () => {
                this.setInput(item.textContent)
                this.closeModal()
            })
        })
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
        this.dispatch('disabled', {
            input: this.$input,
            modal: this.modal,
            floatsam: this,
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
        this._self = this
        this.currentSelected = null
        this.isDisabled = false

        this.setUp()
        // inject the modal onto the page and get an instance of it
        this.initModal()

        // add listener to onInput of input
        this.initInputCheck()

        console.log('we are in dev mode')

        this.dispatch('init', {
            input: this.$input,
            modal: this.modal,
            floatsam: this,
            options: this.options,
        })
    }
}

export default floatsam
