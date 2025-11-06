const badScoreLabel = document.querySelector('.score .bad');
const goodScoreLabel = document.querySelector('.score .good');
const langButtons = document.querySelectorAll('#lang-panel button');
const langToggle = document.querySelector('button#lang-toggle');
const menuToggle = document.querySelector('button#menu-toggle');
const gamePanel = document.querySelector('#game-panel');
const langPanel = document.querySelector('#lang-panel');
const menuPanel = document.querySelector('#menu-panel');

const MODE_UNTIMED = 0;
const MODE_TIMED = 1;
const MODE_REVERSED = 2;

const PANEL_MENU = 0;
const PANEL_LANG = 1;
const PANEL_GAME = 2;

/**
 * @param { number } _version
 */
let gameState = {
    _version: 1,
    round: 0,
    good: 0,
    bad: 0,
    hints: 0,
    consecutive: 0,
    skipped: [],
    mode: MODE_UNTIMED,
    lang: 'fr',
    recent: [],
    errors: {},
    currentPanel: PANEL_GAME
};

let roundState = {
    answer: 0,
    userGuess: -1,
    countryName: '',
    choices: [],
    locked: true
}

let countries;

function initElements() {
    for (const button of langButtons) {
        button.addEventListener('click', selectLang);
    }
    document.addEventListener('keydown', processUserInput);
    menuToggle.addEventListener('click', () => togglePanel(PANEL_MENU));
    langToggle.addEventListener('click', () => togglePanel(PANEL_LANG));
    updateScoreLabels();
    updateLangSelection();
}

function togglePanel(panel) {
    if (panel === gameState.currentPanel)
        gameState.currentPanel = PANEL_GAME;
    else
        gameState.currentPanel = panel;

    updatePanelsVisibility();
}

function updatePanelsVisibility() {
    gamePanel.classList.add('hidden');
    menuPanel.classList.add('hidden');
    langPanel.classList.add('hidden');
    menuToggle.classList.remove('toggled');
    langToggle.classList.remove('toggled');

    switch (gameState.currentPanel) {
        case PANEL_GAME:
            gamePanel.classList.remove('hidden');
            break;

        case PANEL_LANG:
            langPanel.classList.remove('hidden');
            langToggle.classList.add('toggled');
            break;

        case PANEL_MENU:
            menuPanel.classList.remove('hidden');
            menuToggle.classList.add('toggled');
            break;
    }
}

function updateLangSelection() {
    for (const button of langButtons) {
        button.classList.remove('selected');
        if (button.value == gameState.lang)
            button.classList.add('selected');
    }
}

function selectLang(e) {
    const selectedLang = e.currentTarget.value;
    gameState.lang = selectedLang;
    roundState.locked = true;
    updateLangSelection();
    main();
    togglePanel(PANEL_LANG);
}

function updateScoreLabels() {
    // TODO: get score from current GameMode
    badScoreLabel.textContent = gameState.bad;
    goodScoreLabel.textContent = gameState.good;
}

function getRandomCountry(countries, except = null) {
    const random = countries[Math.ceil(countries.length * Math.random())]
    if (random == undefined || random == null || random == except || roundState.choices.includes(random) || gameState.recent.includes(random[0]))
        return getRandomCountry(countries, except);

    return random;
}

async function main() {
    const countriesListPath = `data/${gameState.lang}_country.json`;
    countries = await (await fetch(countriesListPath)).json();
    countries = Object.entries(countries);
}