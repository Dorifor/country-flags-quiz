const flagImageElement = document.querySelector('img#flag-img');
const choice1Button = document.querySelector('button#choice-1');
const choice2Button = document.querySelector('button#choice-2');
const choice3Button = document.querySelector('button#choice-3');
const choice4Button = document.querySelector('button#choice-4');
const nextRoundButton = document.querySelector('button#choice-next');

class FlagChoicesGameMode extends GameMode {
    init() {
        super();

        choice1Button.addEventListener('click', this.selectAnswer);
        choice2Button.addEventListener('click', this.selectAnswer);
        choice3Button.addEventListener('click', this.selectAnswer);
        choice4Button.addEventListener('click', this.selectAnswer);
        nextRoundButton.addEventListener('click', this.round);
        updateScoreLabels();
    }

    async loadCountries() {
        const countriesListPath = `data/${gameState.lang}_country.json`;
        const countries = await(await fetch(countriesListPath)).json();
        this.countries = Object.entries(countries);
    }

    round() {
        if (!this.roundState.locked)
            return;

        this.gameState.round++;
        const country = getRandomCountry(this.countries);
        addToRecent(country);
        this.roundState.choices = [];
        this.roundState.locked = false;
        this.roundState.answer = Math.floor(Math.random() * 4);
        this.roundState.countryName = country[1];
        for (let i = 0; i < 4; i++) {
            if (i === this.roundState.answer)
                this.roundState.choices.push(country);
            else
                this.roundState.choices.push(getRandomCountry(this.countries, country));
        }
        this.reset();
        this.updateElements(country, this.roundState.choices);
        this.saveLocalData();
    }

    processInput(e) {
        if (e.repeat)
            return;

        if (e.key == "1")
            choice1Button.click();
        if (e.key == "2")
            choice2Button.click();
        if (e.key == "3")
            choice3Button.click();
        if (e.key == "4")
            choice4Button.click();
        if (e.key == "Enter" && !this.isChoiceButtonsFocused())
            nextRoundButton.click();
    }

    reset() {
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

    updateElements(countryToGuess, choices) {
        flagImageElement.src = `flags/${countryToGuess[0].toLowerCase()}.webp`;
        choice1Button.textContent = choices[0][1];
        choice2Button.textContent = choices[1][1];
        choice3Button.textContent = choices[2][1];
        choice4Button.textContent = choices[3][1];
    }

    addToRecent(country) {
        this.gameState.recent.push(country[0]);
        if (this.gameState.recent.length > 50)
            this.gameState.recent.shift();
    }

    selectAnswer(e) {
        if (this.roundState.locked)
            return;

        this.roundState.locked = true;
        nextRoundButton.disabled = false;

        this.roundState.userGuess = parseInt(e.currentTarget.value);
        if (this.roundState.userGuess === this.roundState.answer) {
            this.gameState.good++;
        } else {
            this.gameState.bad++;
            this.getButton(this.roundState.userGuess).classList.add('wrong');
        }

        updateScoreLabels();
        this.getButton(this.roundState.answer).classList.add('correct');
    }

    getButton(value) {
        switch (value) {
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

    isChoiceButtonsFocused() {
        return [choice1Button, choice2Button, choice3Button, choice4Button].includes(document.activeElement);
    }

    saveLocalData() {
        localStorage.setItem('save-mode-01', JSON.stringify(this.gameState));
    }

    loadLocalData() {
        if (localStorage.getItem('save-mode-01')) {
            let saved = JSON.parse(localStorage.getItem('save-mode-01'));
            if (saved._version == this.gameState._version) {
                this.gameState = saved;
            } else if (saved.good != undefined && saved.bad != undefined) {
                this.gameState.good = saved.good;
                this.gameState.bad = saved.bad;
            }
        }
    }
}