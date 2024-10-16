class Stack {
    constructor() {
        this.items = [];
    }

    push(element) {
        this.items.push(element);
    }

    getItems() {
        return this.items.slice(); 
    }

    pop() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items.pop();
    }

    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items[this.items.length - 1];
    }

    isEmpty() {
        return this.items.length === 0;
    }

    size() {
        return this.items.length;
    }

    clear() {
        this.items = [];
    }

    remove(element) {
        const index = this.items.indexOf(element);
        if (index !== -1) {
            this.items.splice(index, 1);
        }
    }

    getItems() {
        return this.items.slice(); // Retorna uma cópia do array de itens
    }
}

class HotkeyDisplay {
    constructor(node) {
        this.node = node;
        this.selectors = {
            DATA_KB_GLOBAL_KEY: '[data-kb-global-key]',
        };
        this.attributes = {
            DATA_KB_GLOBAL_KEY: 'data-kb-global-key',
        };
        this.keyDisplayContainer = null;

        // Vincula o método de remoção ao contexto da classe
        this.removeDisplayContainer = this.removeDisplayContainer.bind(this);
    }

    createDisplayContainer() {
        // Cria um elemento para exibir as teclas de atalho
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '10px'; // Distância do topo da tela
        container.style.right = '10px'; // Distância da direita da tela
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Fundo semi-transparente
        container.style.color = 'white'; // Texto branco
        container.style.padding = '10px'; // Padding interno
        container.style.borderRadius = '5px'; // Bordas arredondadas
        container.style.zIndex = '9999'; // Assegura que o container fique acima de outros elementos
        container.style.fontFamily = 'Arial, sans-serif'; // Fonte legível

        // Adiciona um título
        const title = document.createElement('h4');
        title.innerText = 'Teclas de Atalho Globais';
        title.style.margin = '0 0 10px'; // Margem inferior
        container.appendChild(title);

        this.keyDisplayContainer = container;
        document.body.appendChild(this.keyDisplayContainer);

        // Adiciona um listener de clique para remover o container
        container.addEventListener('click', this.removeDisplayContainer);
    }

    showPageGlobalKeys() {
        // Certifique-se de que o container foi criado
        if (!this.keyDisplayContainer) {
            this.createDisplayContainer();
        } else {
            // Limpa o container se já existir
            this.keyDisplayContainer.innerHTML = '<h4>Teclas de Atalho Globais</h4>';
        }

        // Seleciona todos os elementos com o atributo data-kb-global-key
        const buttons = this.node.querySelectorAll(this.selectors.DATA_KB_GLOBAL_KEY);

        // Itera sobre os botões para coletar as teclas de atalho
        buttons.forEach(button => {
            const key = button.getAttribute(this.attributes.DATA_KB_GLOBAL_KEY);
            const buttonText = button.title || button.innerText || button.textContent; // Obtém o texto do botão
            const keyInfo = document.createElement('div');
            keyInfo.innerText = `${key}: ${buttonText}`; // Exibe a tecla e o texto do botão
            this.keyDisplayContainer.appendChild(keyInfo);
        });

        // Define um timeout para remover o container após 5 segundos
        this.autoRemoveTimeout = setTimeout(() => {
            this.removeDisplayContainer();
        }, 5000);
    }

    removeDisplayContainer() {
        if (this.keyDisplayContainer) {
            // Remove o container do DOM
            document.body.removeChild(this.keyDisplayContainer);
            this.keyDisplayContainer = null; // Limpa a referência para o container
            clearTimeout(this.autoRemoveTimeout); // Limpa o timeout se o container for removido antes
        }
    }
}


class HotkeyManager {
    constructor(node) {
        this.node = node;
        this.pressedKeys = new Stack();
        this.selectors = {
            DATA_KB_GLOBAL_KEY: '[data-kb-global-key]',
        };
        this.attributes = {
            DATA_KB_GLOBAL_KEY: 'data-kb-global-key',
        };
        this.keyPressed = {
            ESCAPE: 'Ctrl + Escape',
            ENTER: 'Ctrl + Enter',
            SHOW_GLOBAL_KEYS: 'Ctrl + Alt + H',
        };
        this.hotkeyDisplay = new HotkeyDisplay(node); 
        this.registerEvents();
    }

    showPageGlobalKeys() {
        this.hotkeyDisplay.showPageGlobalKeys();
    }

    normalizeKey(keyStr) {
        return keyStr
            .toUpperCase()
            .replace(/\s+/g, '')
            .split('+')
            .sort()
            .join('+');
    }

    isValidKey(key) {
        const keyFormatted = this.normalizeKey(key);
        return Object.values(this.keyPressed).some(pressedKey => this.normalizeKey(pressedKey) === keyFormatted);
    }

    keyValidation(e) {
        const key = e.getAttribute(this.attributes.DATA_KB_GLOBAL_KEY);
        return key ? this.isValidKey(key) : false;
    }

    cleanEvents() {
        this.node.removeEventListener('keydown', this.onkeydown.bind(this));
        this.node.removeEventListener('keyup', this.onkeyup.bind(this));
        //this.node.addEventListener('click', this.onclick.bind(this));
    }

    registerEvents() {
        this.cleanEvents();

        this.node.addEventListener('keydown', this.onkeydown.bind(this));
        this.node.addEventListener('keyup', this.onkeyup.bind(this));
        //this.node.addEventListener('click', this.onclick.bind(this));
    }

    closeIframe() {
        try {
            const windowRef = window.parent;
            const closeBtn = windowRef.document.body.querySelector(this.selectors.FANCYBOX_CLOSE_BTN);
            
            if (closeBtn) {
                closeBtn.click();
            } else {
                console.warn("Botão de fechar não encontrado.");
            }
        } catch (e) {
            console.error("Erro ao tentar acessar o parent window. Possível violação de mesma origem:", e);
        }
    }

    isIFrame() {
        return window !== window.parent
    }

    handleEscape() {
        if (this.isIFrame()) {
            this.closeIframe();
        }
    }

    onkeyup(e) {
        if (!e) {
            return;
        }

        const { key } = e;

        this.pressedKeys.remove(key);
    }

    onkeydown(e) {
        if (!e) {
            return;
        }

        const { key, shiftKey, altKey, ctrlKey, target } = e;

        this.pressedKeys.push(key);
        const pressedKeys = this.pressedKeys.getItems();

        const pressedKey = `${e.ctrlKey ? 'Ctrl + ' : ''}${e.altKey ? 'Alt + ' : ''}${e.key}`;

        if (this.normalizeKey(pressedKey) === this.normalizeKey(this.keyPressed.SHOW_GLOBAL_KEYS)) {
            this.showPageGlobalKeys();
            return; 
        }

        const buttons = this.node.querySelectorAll(this.selectors.DATA_KB_GLOBAL_KEY);
        const validActions = Array.from(buttons).filter(this.keyValidation.bind(this));

        validActions.forEach(a => {
            const kbKey = a.getAttribute(this.attributes.DATA_KB_GLOBAL_KEY);
            if (this.normalizeKey(pressedKey) === this.normalizeKey(kbKey)) {
                setTimeout(() => {
                    a.click();
                    console.log('CLICK action', a);
                }, 100);
            }
        });
    }
}

class FocusElementAction {

    constructor(element, pos) {
        this.element = element;
        this.pos = pos;

        this.dataAttribute = {
            KEY: 'data-kb-key'
        }

        this.tagNames = {
            A: 'A',
            BUTTON: 'BUTTON',
            EXPAND: '[title="Expand"]',
            COLAPSE: '[title="Colapse"]',
            TD: 'TD',
        }

        this.selectors = {
            DRODOWN_MENU: '.dropdown-menu',
            DROPDOWN_OPEN: '.btn-group.open'
        }

        this.className = {
            DROPDOWN: 'dropdown-toggle',
            DRODOWN_MENU: 'dropdown-menu',
            DROPDOWN_OPEN: 'btn-group, open'
        }

        this.setDataKeyAttribute();
        this.setTagName();
    }

    initDom() {
        this.setKey();
    }

    /** Getters */

    getElement() {
        return this.element;
    }

    generateKey (i) {
        return i < 11 ? `Ctrl + ${i + 1}` : `Ctrl + Alt + ${i - 10}`;
    };

    getTagName() {
        return this.tagName;
    }

    getKeyArray () {
        const key = this.getKey();
        if(key){
            return this.key.split('+').map(part => part.trim())
        }
    }

    getKey() {
        this.setKey();
        return this.key;
    }

    /** Setters */

    setDataKeyAttribute() {
        const i = this.pos;
        const element = this.getElement();
        const hotkey = this.generateKey(i);
        element.setAttribute('data-kb-key', hotkey);
    }

    setTagName() {
        this.tagName = this.element.tagName;
    }

    setKey() {
        this.key = this.element.getAttribute(this.dataAttribute.KEY);
    }

    /** Validations */

    isDropdown() {
        return this.element.classList.contains(this.className.DROPDOWN);
    }

    isActionType() {
        const values = Object.values(this.tagNames);
        for(const v of values) {
            if (v === this.getTagName()){
                return true;
            }
        }
        return false;
    }

    hasKey() {
        const key = this.getKey();
        return key!== null
    }

    validateHotkey(hotkey) {
        const arrayKey = this.getKeyArray();
        if (arrayKey) {
            return (
                this.isActionType() &&
                hotkey.length === arrayKey.length &&
                hotkey.every(k => arrayKey.includes(k))
            );
        }
        return false;
    }

    /** Type */

    dropdown_SALVO(keybordInstance) {
        keybordInstance.setStopNavigation(true);
        this.element.focus();
        this.element.click();   
        const dropdownOpen = this.className.DROPDOWN_OPEN.split(',');
        const dropdownClasses = Array.from(this.element.parentElement.classList);
        const hasDropdownOpen = dropdownOpen.some(className => dropdownClasses.includes(className));
        if (!hasDropdownOpen) {
            keybordInstance.setStopNavigation(false);
        }
    }

    dropdown(keybordInstance) {
        const element = this.getElement();
        const dropdown = element.parentElement;
        if (!dropdown) return;
        keybordInstance.setStopNavigation(true);
        element.focus();
        element.click();       
        const onFocusOut = (e) => {
            // Usando setTimeout para permitir que o foco seja atualizado
            setTimeout(() => {
                if (!dropdown.contains(document.activeElement)) {
                    keybordInstance.setStopNavigation(false);
                    const currContainer = keybordInstance.getCurrContainer();
                    const focusElement = currContainer.getFocusElement();
                    dropdown.classList.remove('open');
                    focusElement.focus();
                    console.log('a',document.activeElement);
                }
            }, 0);
        }
        dropdown.focus();
        dropdown.addEventListener('focusout', onFocusOut.bind(this));
    }
 
    /** ... */

    isArrowKey(key) {
        return (
            key === "ArrowUp" || key === "ArrowDown"
        );
    }

    execute(keybordInstance, key) {
        const element = this.element;

        if(this.isDropdown() ) {
            this.dropdown(keybordInstance)
        } else {
            element.click();
        }
    }
}

class FocusElement {

    constructor(element) {
        this.element = element;

        this.setupElement();

        this.selectors = {
            ROW_ACTIONS: ['a',
                '[title="Expand"]',
                '[title="Collapse"]',
                'button'
            ],
            TABS: '[role="tab"]'
        }

        this.tagNames = {
            ROW: 'TR'
        }

        //this.setActions();
    }

    setupElement() {
        if (this.isRow()) {
            this.element.setAttribute('tabindex', 0);
        }
    }

    initDom(){
        this.setActions();
    }

    validFocusable(element) {
        if (!element) {
            return false;
        }

        if (element.hasAttribute('readonly')) {
            return false;
        }

        if (element.hasAttribute('tabindex') && element.getAttribute('tabindex') === '-1') {
            return false;
        }

        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return false;
        }

        let tmpElement = element;
        while (tmpElement) {
            const style = window.getComputedStyle(tmpElement);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                return false;
            }
            tmpElement = tmpElement.parentElement;
        }

        return true;
    }

    getElement() {
        return this.element
    }

    isRow() {
        return (
            this.element instanceof HTMLTableRowElement
        );
    }

    isTab() {
        return (
            this.element.closest(this.selectors.TABS)
        )
    }

    hasActions() {
        return(
            this.isRow()
        )
    }

    rowsActions() {
        const element = this.element;

        const combinedSelectors = this.selectors.ROW_ACTIONS.join(', ');

        // Processa os elementos que são focáveis e adiciona suas respectivas ações
        this.actions = Array
            .from(element.querySelectorAll(combinedSelectors))
            .filter(this.validFocusable)
            .reverse()
            .map((e, i) =>  new FocusElementAction(e, i));
    }

    getActions(){
        this.setActions();
        return this.actions;
    }

    setActions() {
        if (!this.hasActions()){
            return;
        }

        if (this.isRow()) {
            this.rowsActions();
        }
    }
}


class DomObserver {
    constructor(name, selector, callback) {
        this.name = name;
        this.selector = selector;
        this.observer = new MutationObserver(this.handleMutations.bind(this));
        this.isObserved = false;
        this.callback = callback;
    }

    observe() {
        const targetElement = document.querySelector(this.selector);
        if (targetElement) {
            this.observer.observe(targetElement, {
                childList: true,  
                attributes: true, 
                subtree: true,    
            });
            console.log(`${this.name} is being observed.`);
            this.isObserved = true; 
        } else {
            console.error(`Element ${this.selector} not found.`);
        }
    }

    disconnect() {
        if (this.isObserved) {
            this.observer.disconnect();
            console.log(`${this.name} observer has been disconnected.`);
            this.isObserved = false; 
        }
    }

    handleMutations(mutationsList) {
        mutationsList.forEach((mutation) => {
            if (mutation.type === 'childList') {
                this.callback();

                console.log(`[${this.name}] Children list changed in ${this.selector}.`);
            } else if (mutation.type === 'attributes') {
                console.log(`[${this.name}] Attributes changed in ${mutation.target.tagName}.`);
            }
        });
    }


    checkElementReady() {
        const callback = (_) => {
            this.observe();
        }

        const intervalId = setInterval(() => {
            const element = document.querySelector(this.selector);
            if (element) {
                clearInterval(intervalId);
                callback(element);
            }
        }, 100);
    }
}

class Container {

    constructor(name, selector, selectorElements, exclude=null) {
        this.name = name;
        this.selector = selector;
        this.selectorElements = selectorElements;
        this.container = document.querySelector(selector);
        this.exclude = exclude;

    }

    initDom() {
        this.setElements();

        const focusableElements = this.getFocusElements();
        if(focusableElements && focusableElements.length > 0) {
            this.initFocusableElemenets(focusableElements);
        }
        const actions = this.getActions();
        if (actions && actions.length) {
            this.initActions(actions);
        }
    }

    initFocusableElemenets(focusableElements){
        focusableElements.forEach(f => f.initDom());
    }

    initActions(actions) {
        actions.forEach(a => a.initDom());
    }

    getActions() {
        const focusElements = this.getFocusElements();

        if (!focusElements || focusElements.length === 0) {
            return [];
        }

        const allActions = [];

        for (const element of focusElements) {
            if (typeof element.getActions === 'function') {
                const actions = element.getActions();
                if (actions) {
                    allActions.push(...actions);
                }
            }
        }

        return allActions;
    }

    getExclude() {
        return this.exclude;
    }

    setFocusElementPos(value) {
        if (!isNaN(value)) {
            this.focusElementPos = value;
        }
    }

    getSelector() {
        return this.selector;
    }

    getSelectorElements() {
        return this.selectorElements;
    }

    combineSelector(containerSelector, interactives) {
        if (!containerSelector || typeof containerSelector !== 'string') {
            throw new Error('Um seletor de contêiner válido deve ser fornecido.');
        }

        return interactives.map(selector => `${containerSelector} ${selector}`).join(', ');
    }

    updateFocusElementPos(newPos) {
        if (!isNaN(newPos) && newPos >= 0) {
            console.log(newPos);
            this.focusElementPos = newPos;
        }
    }

    getFocusElementPos() {
        //console.log('f', this.focusElementPos);
        return this.focusElementPos;
    }

    isValidPos(pos) {
        const elements = this.getElements();
        return (
            !isNaN(pos)
            && elements && elements.length > 0
            && pos < elements.length
            && this.validFocusable(elements[pos])
        );
    }

    getNextValidPos(direction, isContainerChanged=false, isLoop=false) {
        const elements = this.getElements();
        let newPos = !isContainerChanged ? ( this.focusElementPos + direction ) : ( direction < 0 ? (elements.length - 1): 0 );
        const length = elements.length;
        //let newPos = pos + direction ;
        let attempts = 0;

        if (isLoop && (newPos >= length || newPos < 0)) {
            return newPos;
        }

        while (!this.isValidPos(newPos) && attempts < length) {
            newPos = (newPos + direction + length) % length;

            if (isLoop && (newPos >= length || newPos < 0)) {
                return;
            }

            if (++attempts >= length) break; // Evita loop infinito
        }

        return newPos;
    }

    getName() {
        return this.name;
    }

    getPos(){
        return this.pos;
    }

    validFocusable(element) {
        if (!element) {
            return false;
        }

        const toBeExcluded = this.getExclude();
        if (toBeExcluded && toBeExcluded.length > 0) {
            for (const selector of toBeExcluded) {
                if (element.closest(selector)) return false;
            }
        }

        if (element.hasAttribute('readonly')) {
            return false;
        }

        if (element.hasAttribute('tabindex') && element.getAttribute('tabindex') === '-1') {
            return false;
        }

        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return false;
        }

        let tmpElement = element;
        while (tmpElement) {
            const style = window.getComputedStyle(tmpElement);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                return false;
            }
            tmpElement = tmpElement.parentElement;
        }

        return true;
    }

    getElements() {
        this.elements = this.getFocusables();
        return this.elements.map(e => e.element);
    }

    getFocusElements() {
        return this.elements;
    }

    getElementAction(pos) {
        if (!isNaN(pos)) {
            const elements = this.getElements();
            return elements[pos].map(e => e.actions).filter(a => a === null);
        }
    }

    buildFocusElement(element) {
        return new FocusElement(element)
    }

    getFocusables() {
        const selector = this.selector;
        const elementSelectors = this.selectorElements;
        const compoundSelectors = this.combineSelector(selector, elementSelectors)

        return Array
            .from(document.body.querySelectorAll(compoundSelectors))
            .filter(this.validFocusable.bind(this))
            .map(this.buildFocusElement.bind(this))
    }

    setElements() {
        this.elements = this.getFocusables();
    }

    isValidContainer() {
        const elements = this.getFocusables()

        return (
            elements && elements.length > 0
        );
    }

    setNextName(nextName) {
        this.nextName = nextName;
    }

    setPrevName(prevName) {
        this.prevName = prevName;
    }

    setPos(pos){
        this.pos = pos;
    }

    setNextPos(nextPos) {
        this.nextPos = nextPos;
    }

    setPrevPos(prevPos) {
        this.prevPos = prevPos;
    }

    getNextPos() {
        return this.nextPos;
    }

    getPrevPos() {
        return this.prevPos;
    }

    getFocusElement() {
        const elements = this.getElements();
        const focusElementPos = this.getFocusElementPos();
        return elements[focusElementPos];
    }

    getFocusElementByTarget(target) {
        if (!target) return;
        const elements = this.getElements();
        if (elements.length <= 0) return;
        const indexOf = elements.indexOf(target);
        if (!this.isValidPos(indexOf)) return
        const focusElements = this.getFocusElements()
        return focusElements[indexOf];
    }

}


class Keyboard {

    constructor(node) {
        this.node = node;
        this.stopNavigation = false;
        this.isLoop = true;

        this.animationTimes = {
            SM: 100,
            MD: 200,
            LG: 500,
            XXL_TEST: 2000,
        }

        this.className ={
            ACTIVE: "kb-active",
            TABS: "[role='tab']"
        }

        this.selectors = {
            TAB_PANE: '.tab-pane',
            TABS: '[role="tablist"]',
            FANCYBOX_CLOSE_BTN: '.fancybox-item.fancybox-close'
        }

        this.keyPressed = {
            ARROW_UP: "ArrowUp",
            ARROW_DOWN: "ArrowDown",
            TAB: "Tab",
            ENTER: "Enter",
            CTRL: "Ctrl",
            SHIFT: "Shift",
            ESCAPE: "Escape"
        }

        for(let i=0; i<11; i++) {
            this.keyPressed = {
                ...this.keyPressed,
                [`F${i + 1}`]: `F${i + 1}`
            }
        }

        this.interactiveSelectors = [
            'a',              // Links
            'button',         // Botões
            'input',          // Campos de entrada (text, password, email, etc.)
            'textarea',       // Textareas
            'select',         // Menus suspensos (selects)
            //'details',        // Elemento de detalhes que pode ser expandido
            //'summary',        // Resumo do elemento details
            //'label',          // Rótulos para campos de formulário
            //'fieldset',       // Agrupamento de campos de formulário
            //'output',         // Saída de resultados de cálculos
            //'menuitem',       // Itens de menu em menus
            //'[contenteditable]', // Elementos que podem ser editados
            '[tabindex]',     // Elementos que podem ser acessados via tabulação
            'area',           // Área dentro de uma imagem mapeada
            //'audio',          // Elementos de áudio (com controles)
            //'video',          // Elementos de vídeo (com controles)
            //'canvas',         // Elemento de canvas (usado para gráficos)
            //'iframe',         // IFrames (se interativos)
            //'svg',            // SVGs que podem ser interativos
            //'time',           // Elemento de tempo
        ];

        this.containerName = {
            FILTER: "filter",
            ROW: "row",
            PAGINATOR: "pagination",
            FORM_BODY: "form_body",
            TABS: "tabs",
        }

        this.containersData = [
            {
                name: this.containerName.FILTER,
                selector: '.kv-grid-table thead .filters',
                selectorElements: ['input'],
            },
            {
                name: this.containerName.ROW,
                selector: '.kv-grid-table',
                selectorElements: ['tbody tr'],
            },
            {
                name: "pagination",
                selector: '.pagination',
                selectorElements: ['a', 'button'],
            },
            {
                name: "form_body",
                selector: '.form',
                selectorElements: this.interactiveSelectors,
                exclude: ['.kv-grid-panel']
            },
            {
                name: "tabs",
                selector: '.nav-tabs',
                selectorElements: ['[role="tab"]'],
            },
        ];

        this.containerPos = -1;

        this.init(this.containerPos);
        this.registerEvents();
    }

    init(containerPos, direction=1) {
        this.pageMap = this.buildPageMap(this.containersData);

        this.setContainerPos(containerPos, direction);
        this.focus(0);
    }

    /** Getters */
    /** Setters */
    /** Setters */

    buildPageMap(containersData) {
        const map = [];
        const instances = [];

        containersData.forEach(containerData => {
            const { name, selector, selectorElements, exclude } = containerData;
            const instance = new Container(name, selector, selectorElements, exclude);

            instances.push(instance);
        });

        let counter = 0;
        for (let pos = 0; pos < instances.length; pos++) {
            const container = instances[pos];

            container.setElements()

            const firstFocus = container.isValidPos(0) ? 0 : container.getNextValidPos(0, this.isContainerChanged);
            container.setFocusElementPos(firstFocus);

            if(!container.isValidContainer()) {
                continue
            };

            const nextPos = this.getNextValidContainerPos(instances, pos, 1);
            const prevPos = this.getNextValidContainerPos(instances, pos, -1);

            if (nextPos === false || prevPos === false) {
                console.warn("Invalid params.");
                return;
            }

            const nextContainer = instances[nextPos];
            const prevContainer = instances[prevPos];

            container.setNextPos(nextPos);
            container.setPrevPos(prevPos);
            container.setNextName(nextContainer.getName());
            container.setPrevName(prevContainer.getName());

            container.setPos(counter);
            counter++

            map.push(container);
        }

        return map;
    }

    setStopNavigation(flag) {
        this.stopNavigation = flag;
    }

    getContainerPos(){
        return this.containerPos;
    }

    updateContainerPos(newPos){
        this.containerPos = newPos;
    }

    clearEvents() {
        this.node.removeEventListener('keydown', this.onkeydown.bind(this));
        this.node.removeEventListener('click', this.onclick.bind(this));
    }

    registerEvents(){
        this.clearEvents();

        this.node.addEventListener('keydown', this.onkeydown.bind(this));
        this.node.addEventListener('click', this.onclick.bind(this));
    }

    isValidContainerPos(pos, instances){
        return (
            !isNaN(pos) && pos >= 0
            && instances
            && pos < instances.length
            && instances[pos].isValidContainer()
        );
    }


    getNextContainerPos(pos, direction, instances) {
        const length = instances.length;
        let newPos = (pos + direction + length) % length;

        let attempts = 0;
        while (!instances && !instances[newPos].isValidContainer(newPos, instances) && attempts < length) {
            newPos = this.getNextContainerPos(
                newPos,
                direction,
                instances
            )
            if (++attempts >= length) break; // Evita loop infinito
        }

        return newPos;
    }

    getNextValidContainerPos(instances, pos, direction) {
        let newPos = this.getNextContainerPos(
            pos,
            direction,
            instances
        )

        if (newPos === false || isNaN(newPos) || newPos === null) {
            return false;
        }

        return newPos;
    }

    setContainerPos(pos, direction) {
        const pageMap = this.getPageMap();
        const newPos = this.getNextValidContainerPos(pageMap, pos, direction);

        if (this.isInvalidPosition(newPos)) return;

        this.updateContainerPos(newPos);
    }

    isInvalidPosition(newPos) {
        const pageMap = this.getPageMap();
        return isNaN(newPos) || !this.isValidContainerPos(newPos, pageMap);
    }

    setPrevContainer(container) {
        if (container) {
            this.prevContainer = container;
            this.setIsContainerChanged(true);
        }
    }

    getPrevContainer() {
        return this.prevContainer;
    }

    getPageMap(){
        return this.pageMap;
    }

    getCurrContainer() {
        const pageMap = this.getPageMap();
        const containerPos = this.getContainerPos()

        if (
            pageMap && pageMap.length > 0
            && !isNaN(containerPos) && containerPos < pageMap.length
            && pageMap[containerPos]?.isValidContainer()
        ) {
            return pageMap[this.containerPos]
        }

        return null;
    }

    isArrowKey(key){
        return (
            key === this.keyPressed.ARROW_UP || key === this.keyPressed.ARROW_DOWN
        );
    }

    isTabKey(key) {
        return (
            key === this.keyPressed.TAB
        );
    }

    setIsContainerChanged(flag) {
        this.isContainerChanged = flag;
    }

    getIsContainerChanged() {
        return this.isContainerChanged;
    }

    removeActiveClass() {
        const container = this.getCurrContainer();

        let elements;
        let pos = container.getFocusElementPos();

        if (this.getIsContainerChanged()) {
            this.setIsContainerChanged(false);
            const prevContainer = this.getPrevContainer();
            pos = prevContainer.getFocusElementPos(); 
            elements = prevContainer.getElements();
        } else {
            elements = container.getElements()
        }

        elements[pos].classList.remove(this.className.ACTIVE);
    }

    addActiveClass(element){
        element.classList.add(this.className.ACTIVE);
    }


    getFocusElementByTarget(target) {
        const container = this.getCurrContainer();

        if(container) {
            return container.getFocusElementByTarget(target);
        }
    }

    getFocusElementByPos(pos) {
        const container = this.getCurrContainer();

        if(container) {
            const focusElements = container.getFocusElements();
            return focusElements[pos];
        }
    }

    getFocusElement(value) {
        if (!isNaN(value) && value >= 0) {
            return this.getFocusElementByPos(value);
        } else {
            return this.getFocusElementByTarget(value);
        }
    }

    getContainerByName(containerName) {
        if (!containerName) return;
        
        const pageMap = this.getPageMap() ;

        for (const container of pageMap) {
            if (container.getName() === containerName) {
                return container
            }
        }
    }
    
    focusPointer(pos) {
        let container = this.getCurrContainer();

        if (!container) return;

        if (!container.isValidPos(pos)) return false;

        let elements = container.getElements();

        if (!elements || elements.length === 0) return;

        const focusElementPos = container.getFocusElementPos();

        // Remove a classe ACTIVE do elemento atualmente focado
        if (!isNaN(focusElementPos) && elements[focusElementPos]) {
            this.removeActiveClass();
        }

        // Adiciona a classe ACTIVE ao novo elemento
        elements[pos].classList.add(this.className.ACTIVE);

        container.updateFocusElementPos(pos);

        return true;
    }

    focus(pos) {
        if (this.focusPointer(pos)) {
            const container = this.getCurrContainer();
            const elements = container.getElements();
            elements[pos].focus();
        }
    }

    getNewContainerNextElementPos(direction) {
        this.setPrevContainer(this.getCurrContainer());
        //this.setIsContainerChanged(true);
        this.setContainerPos(this.getCurrContainer().getPos(), direction);
        const currContainer = this.getCurrContainer();
        const elements = currContainer.getElements();
        const tmpPos = direction === -1 ? (elements.length - 1) : 0;
        return currContainer.isValidPos(tmpPos) ? tmpPos : currContainer.getNextValidPos(direction, this.isContainerChanged);
        //return currContainer.isValidPos(0) ? 0 : currContainer.getNextContainerPos(1, this.isContainerChanged);
    }

    getNextValidElementPos(direction) {
        const container = this.getCurrContainer();

        if (!container) {
            return false;
        }

        let newPos = container.getNextValidPos(direction, this.isContainerChanged, this.isLoop);

        if (!container.isValidPos(newPos)) {
            newPos = this.getNewContainerNextElementPos(direction);
        }

        if (newPos === false) {
            return false;
        }

        return newPos;
    }

    handleArrows(key) {
        const  { next, prev } = { next: 1, prev: -1 }

        return key === this.keyPressed.ARROW_DOWN 
            ? this.getNewContainerNextElementPos(next) 
            : this.getNewContainerNextElementPos(prev);
    }

    handleShiftKey(shiftKey) {
        const  { next, prev } = { next: 1, prev: -1 }

        return shiftKey ? this.getNextValidElementPos(prev) : this.getNextValidElementPos(next)
    }


    handleFallback(key, ctrlKey, shiftKey) {
        const focusElement = this.getFocusElement(this.getCurrContainer().getFocusElementPos());

        if(focusElement && focusElement.isRow()){
            const actions = focusElement.getActions();

            if (ctrlKey && shiftKey) {
                const hotkey = `Shift + Ctrl + ${key}`.split('+').map(v => v.trim());
                actions.forEach(a => a.hasKey() && a.validateHotkey(hotkey) && a.execute(this, key));
            } else if (ctrlKey) {
                const hotkey = `Ctrl + ${key}`.split('+').map(v => v.trim());
                actions.forEach(a => a.hasKey() && a.validateHotkey(hotkey) && a.execute(this, key));
            }
        }
    }

    onclick(e) {
        if(!e || this.stopNavigation) {
            if (this.preventDefault) {
                e.preventDefault();
                e.stopPropagation();
            }
            return;
        }

        const { target } = e;

        if (target.closest(this.selectors.TABS)) {
            this.resetPageMap();
            this.removeActiveClass();
        }
    }

    setPreventDefault(flag) {
        this.preventDefault = flag;
    }

    resetPageMap() {
        this.setStopNavigation(true);
        this.setPreventDefault(true);

        const action = () => {
            const currContainer = this.getCurrContainer();
            this.setPrevContainer(currContainer);
            this.init(currContainer.getPos()); 
            this.setStopNavigation(false);
            this.setPreventDefault(false);
        };

        this.setPrevContainer(this.getContainerByName(this.containerName.TABS));
    
        setTimeout(action.bind(this), this.animationTimes.LG);
    }
    

    handleEnter(target) {
        if (target.closest(this.selectors.TABS)) {
            target.click();
        }
    }

    onkeydown(e){
        if(!e || this.stopNavigation) {
            if (this.preventDefault) {
                e.preventDefault();
                e.stopPropagation();
            }
            return;
        }

        const { key, altKey, ctrlKey, shiftKey, target } = e;

        let caretPos;
        let preventDefault;
        let focusState;

        if (this.isArrowKey(key)) {
            caretPos = this.handleArrows(e.key);
            focusState = true;
            preventDefault = true;
        } else if (this.isTabKey(key, shiftKey)){
            caretPos = this.handleShiftKey(shiftKey);
            focusState = true;
            preventDefault = true;
        } else if (this.keyPressed.ENTER === e.key) {
            this.handleEnter(target);
        } else  {
            this.handleFallback(key, ctrlKey, shiftKey);
        }

        if(preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (focusState) {
            this.focus(caretPos);
        }
    }
}



new HotkeyManager(document.body);
const c = new Keyboard(document.body);