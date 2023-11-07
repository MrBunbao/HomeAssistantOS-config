/*
Add a link to the sidebar to any path in Home Assistant
Put this file in <config>/www/panel-redirect.js
*/
class PanelRedirect extends HTMLElement {
    connectedCallback() {
      if (this._info) {
        this._navigate();
      }
    }
  
    set panel(info) {
      this._info = info;
  
      if (this.isConnected) {
        this._navigate();
      }
    }
  
    _navigate() {
      history.replaceState(null, "", this._info.config.target);
      const event = new Event("location-changed", {
        bubbles: true,
        composed: true,
      });
      event.detail = { replace: true };
      this.dispatchEvent(event);
    }
  }
  
  customElements.define("panel-redirect", PanelRedirect);
  