class CounterElement extends HTMLElement {
    count: number;

    constructor() {
      super();
      this.count = 0;
      this.attachShadow({ mode: 'open' });
    }
  
    connectedCallback() {
      this.render();
      this.shadowRoot!.querySelector('#CounterButton')?.addEventListener('click', () => {
        this.count++;
        this.render();
      });
    }
  
    render() {
      this.shadowRoot!.innerHTML = `
        <style>
          #CounterButton { padding: 5px 10px; margin: 5px; }
        </style>
        <button id="CounterButton">Click Me</button>
        <span>Count: ${this.count}</span>
      `;
    }
}

customElements.define('counter-element', CounterElement);

export default CounterElement;