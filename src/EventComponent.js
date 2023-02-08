import DispatcherEvent from './DispatcherEvent'

class EventComponent {
    ////////////////////////////////////////////////////
    // construct
    ////////////////////////////////////////////////////
    constructor() {
        this.events = {}
        this.uid = Math.floor(1000 + Math.random() * 90000)
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

    addEventListener(eventName, callback) {
        let event = this.events[eventName]
        if (!event) {
            event = new DispatcherEvent(eventName)
            this.events[eventName] = event
        }
        event.registerCallback(callback)
    }

    removeEventListener(eventName, callback) {
        const event = this.events[eventName]
        if (event && event.callbacks.indexOf(callback) > -1) {
            event.unregisterCallback(callback)
            if (event.callbacks.length === 0) {
                delete this.events[eventName]
            }
        }
    }
}

export default EventComponent
