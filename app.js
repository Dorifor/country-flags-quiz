const flagImageElement = document.querySelector('img#flag-img');
const choice1Button = document.querySelector('button#choice-1');
const choice2Button = document.querySelector('button#choice-2');
const choice3Button = document.querySelector('button#choice-3');
const choice4Button = document.querySelector('button#choice-4');
const nextRoundButton = document.querySelector('button#choice-next');

const MODE_UNTIMED = 0;
const MODE_TIMED = 1;
const MODE_REVERSED = 2;

const options = {
    lang: 'fr'
};

const gameState = {
    round: 0,
    score: 0,
    hints: 0,
    consecutive: 0,
    skipped: [],
    mode: MODE_UNTIMED
};

const roundState = {
    answer: 0,
    userGuess: -1,
    countryName: '',
    choices: [],
    locked: true
}

let countries;

function initButtons() {
    choice1Button.addEventListener('click', selectAnswer);
    choice2Button.addEventListener('click', selectAnswer);
    choice3Button.addEventListener('click', selectAnswer);
    choice4Button.addEventListener('click', selectAnswer);
    nextRoundButton.addEventListener('click', round);
}

function getUserSelectedButton() {
    switch (roundState.userGuess) {
        case 0:
            return choice1Button;

        case 1:
            return choice2Button;

        case 2:
            return choice3Button;

        case 3:
            return choice4Button;
    }
}

function getAnswerButton() {
    switch (roundState.answer) {
        case 0:
            return choice1Button;

        case 1:
            return choice2Button;

        case 2:
            return choice3Button;

        case 3:
            return choice4Button;
    }
}

function resetQuizElements() {
    nextRoundButton.disabled = true;
    choice1Button.classList.remove('wrong');
    choice1Button.classList.remove('correct');
    choice2Button.classList.remove('wrong');
    choice2Button.classList.remove('correct');
    choice3Button.classList.remove('wrong');
    choice3Button.classList.remove('correct');
    choice4Button.classList.remove('wrong');
    choice4Button.classList.remove('correct');
}

function selectAnswer(e) {
    if (roundState.locked)
        return;

    roundState.locked = true;
    nextRoundButton.disabled = false;

    roundState.userGuess = parseInt(e.target.value);
    if (roundState.userGuess === roundState.answer) {
        gameState.score++;
    } else {
        getUserSelectedButton().classList.add('wrong');
    }

    getAnswerButton().classList.add('correct');
}

function getRandomCountry(countries, except = null) {
    const random = countries[Math.ceil(countries.length * Math.random())]
    if (random == except || roundState.choices.includes(random))
        return getRandomCountry(countries, except);

    return random;
}

function updateQuizElements(countryToGuess, choices) {
    flagImageElement.src = `flags/${countryToGuess[0].toLowerCase()}.webp`;
    choice1Button.textContent = choices[0][1];
    choice2Button.textContent = choices[1][1];
    choice3Button.textContent = choices[2][1];
    choice4Button.textContent = choices[3][1];
}

function round() {
    if (!roundState.locked)
        return;

    gameState.round++;
    resetQuizElements();
    const country = getRandomCountry(countries);
    roundState.choices = [];
    roundState.locked = false;
    roundState.answer = Math.floor(Math.random() * 4);
    roundState.countryName = country[1];
    for (let i = 0; i < 4; i++) {
        if (i === roundState.answer)
            roundState.choices.push(country);
        else
            roundState.choices.push(getRandomCountry(countries, country));
    }
    updateQuizElements(country, roundState.choices);
}

async function main() {
    const countriesListPath = `data/${options.lang}_country.json`;
    countries = await (await fetch(countriesListPath)).json();
    countries = Object.entries(countries);
    round();
}

initButtons();
main();