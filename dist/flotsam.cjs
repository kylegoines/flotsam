function t(e,i){return t=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t},t(e,i)}var e=/*#__PURE__*/function(){function t(t){this.eventName=t,this.callbacks=[]}var e=t.prototype;return e.registerCallback=function(t){this.callbacks.push(t)},e.unregisterCallback=function(t){var e=this.callbacks.indexOf(t);e>-1&&this.callbacks.splice(e,1)},e.fire=function(t){this.callbacks.slice(0).forEach(function(e){e(t)})},t}(),i="is-open";module.exports=/*#__PURE__*/function(e){var s,n;function o(t){var i;return(i=e.call(this)||this).options=t,i.$input=t.el,i.data=!!t.data&&t.data,i.minChars=t.minChars?t.minChars:2,i.inputPreview=!t.inputPreview||t.inputPreview,i.onAjax=t.onAjax,i.hint=t.hint?t.hint:"When autocomplete results are available use up and down arrows to review and enter to select.",i.isEmpty=!0,i.hasEmptyState=!0,i.isOpen=!1,i.init(),i}n=e,(s=o).prototype=Object.create(n.prototype),s.prototype.constructor=s,t(s,n);var a=o.prototype;return a.setUp=function(){this.$input.setAttribute("autocomplete","off"),this.$input.setAttribute("aria-expanded","false"),this.$input.setAttribute("aria-haspopup","listbox"),this.$input.setAttribute("role","combobox"),this.$input.setAttribute("aria-autocomplete","list"),this.$input.setAttribute("aria-owns","modal-"+this.uid+"-list"),this.$input.id="autocomplete-input-"+this.uid,this.$input.setAttribute("aria-describedby","assistiveHint-"+this.uid)},a.initModal=function(){this.$input.insertAdjacentHTML("afterend",this.generateModal()),this.$input.insertAdjacentHTML("afterend",this.generateAssistiveHint()),this.$input.insertAdjacentHTML("afterend",this.generateStatus()),this.$modal=document.querySelector("#modal-"+this.uid),this.$status=document.querySelector("#status-"+this.uid),this.list=this.$modal.querySelector(".autocomplete-modal__list"),this.$empty=this.$modal.querySelector(".autocomplete-modal__empty"),this.$modal.style.pointerEvents="none",this.$modal.style.visibility="hidden"},a.initInputCheck=function(){var t=this;this.isDisabled||this.$input.addEventListener("input",this.onAjax?function(i){t.value=i.target.value,t.minCharsExcceded()?(e.prototype.dispatch.call(t,"loadingData",{input:t.$input,modal:t.$modal,flotsam:t,options:t.options}),t.onAjax(t.value).then(function(i){t.data=i,e.prototype.dispatch.call(t,"loadedData",{input:t.$input,modal:t.$modal,flotsam:t,options:t.options}),t.update()})):t.isOpen&&t.closeModal()}:function(e){t.value=e.target.value,t.minCharsExcceded()?t.update():t.isOpen&&t.closeModal()})},a.generateAssistiveHint=function(){return'\n            <div id="assistiveHint-'+this.uid+'" style="display: none">\n                '+this.hint+"\n            </div>\n        "},a.generateStatus=function(){return'\n            <div id="status-'+this.uid+'" aria-role=\'status\' aria-live="polite" style="display: none">\n                \n            </div>\n        '},a.update=function(){var t=this;0!==this.data.length&&(this.data=this.data.filter(function(e){if(e.toLowerCase().includes(t.value.toLowerCase()))return e})),0===this.data.length?this.showEmptyState():(this.hideEmptyState(),this.generateListItems(),!1===this.isOpen&&this.openModal())},a.preventSubmit=function(t){t.preventDefault()},a.showEmptyState=function(){this.removeListItems(),this.$empty.innerHTML='<div>Sorry there are no results for <strong>"'+this.value+'"</strong> please search again</div>',this.$empty.style.display="block",this.isOpen||this.openModal()},a.hideEmptyState=function(){this.$empty.innerHTML="",this.$empty.style.display="none"},a.openModal=function(){this.isDisabled||(document.addEventListener("submit",this.preventSubmit),this.checkKey=this.checkKey.bind(this),document.addEventListener("keydown",this.checkKey,!0),this.isOpen=!0,this.$modal.style.pointerEvents="auto",this.$modal.style.visibility="visible",this.$input.classList.add(i),this.$input.setAttribute("aria-expanded","true"),e.prototype.dispatch.call(this,"openModal",{input:this.$input,modal:this.$modal,flotsam:this,options:this.options}))},a.closeModal=function(){this.hideEmptyState(),this.removeListItems(),this.unsetSelected(),this.isOpen&&(document.removeEventListener("submit",this.preventSubmit),document.removeEventListener("keydown",this.checkKey,!0)),this.$modal.style.pointerEvents="none",this.$modal.style.visibility="hidden",this.$input.classList.remove(i),this.$input.focus(),this.isOpen=!1,e.prototype.dispatch.call(this,"closeModal",{input:this.$input,modal:this.$modal,flotsam:this,options:this.options})},a.checkKey=function(t){"38"==t.keyCode?this.selectPrev():"40"==t.keyCode?this.selectNext():"37"==t.keyCode||"39"==t.keyCode||("27"==t.keyCode||"9"==t.keyCode?(t.preventDefault(),this.closeModal()):"13"==t.keyCode&&(t.preventDefault(),this.closeModal(),this.$input.closest("form").submit()))},a.selectItem=function(){var t=this;[].concat(this.list.querySelectorAll("li")).forEach(function(i,s){s===t.currentSelected?(i.classList.add("selected-item"),i.setAttribute("aria-selected","true"),console.log(i.id),console.log(i),t.$input.setAttribute("aria-activedescendant",i.id),t.inputPreview&&t.setInput(i.innerText),e.prototype.dispatch.call(t,"selectKey",{selected:i.textContent,input:t.$input,modal:t.$modal,flotsam:t,options:t.options})):(i.classList.remove("selected-item"),i.setAttribute("aria-selected","false"))})},a.selectNext=function(){this.currentSelected=null===this.currentSelected?0:this.currentSelected+1,this.selectItem()},a.selectPrev=function(){this.currentSelected=this.currentSelected-1,this.selectItem()},a.unsetSelected=function(){this.currentSelected=null;var t=[].concat(this.list.querySelectorAll("li"));this.$input.removeAttribute("aria-activedescendant"),t.forEach(function(t){t.classList.remove("selected-item")})},a.generateModal=function(){return console.log(this.uid),'\n        <div class="autocomplete-modal" id="modal-'+this.uid+'" >\n            <div class="autocomplete-modal__inner">\n                <ul \n                    class="autocomplete-modal__list" \n                    role="listbox" \n                    id="modal-'+this.uid+'-list">\n                </ul>\n                <div class="autocomplete-modal__empty" style="display: none"></div>\n            </div>\n        </div>\n    '},a.generateListItems=function(){var t=this;this.unsetSelected();var e="";this.data.forEach(function(i,s){var n=new RegExp(t.value,"gi"),o=i.replace(n,function(t){return'<span class="autocomplete-modal__list-highlight">'+t+"</span>"});e+='\n                <li class="autocomplete-modal__list-item" role="option" aria-posinset="'+(s+1)+'" aria-setsize="'+t.data.length+'" aria-selected="false" id="list-item-'+s+"--"+t.uid+'" tab-index="-1">\n                    '+o+"\n                </li>"}),this.list.innerHTML=e,[].concat(this.list.querySelectorAll("li")).forEach(function(e){e.addEventListener("click",function(){t.setInput(e.innerText),t.closeModal()})})},a.removeListItems=function(){this.list.innerHTML=""},a.setInput=function(t){this.$input.value=t},a.triggerClose=function(){this.closeModal()},a.triggerDisable=function(){this.isDisabled=!0,this.closeModal(),e.prototype.dispatch.call(this,"disabled",{input:this.$input,modal:this.$modal,flotsam:this,options:this.options})},a.triggerEnable=function(){this.isDisabled=!1},a.minCharsExcceded=function(){return this.value.length>=this.minChars},a.init=function(){var t=this;this._self=this,this.currentSelected=null,this.isDisabled=!1,this.setUp(),this.initModal(),this.initInputCheck(),console.log(this.uid),setTimeout(function(){e.prototype.dispatch.call(t,"init",{input:t.$input,modal:t.$modal,flotsam:t,options:t.options})},0)},o}(/*#__PURE__*/function(){function t(){this.events={},this.uid=Math.floor(1e3+9e4*Math.random())}var i=t.prototype;return i.dispatch=function(t,e){var i=this.events[t];i&&i.fire(e)},i.on=function(t,i){var s=this.events[t];s||(s=new e(t),this.events[t]=s),s.registerCallback(i)},i.off=function(t,e){var i=this.events[t];i&&i.callbacks.indexOf(e)>-1&&(i.unregisterCallback(e),0===i.callbacks.length&&delete this.events[t])},t}());
//# sourceMappingURL=flotsam.cjs.map
