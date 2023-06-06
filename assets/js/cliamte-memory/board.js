/** ***********************************************
 *          GAME BOARD CREATION
 ************************************************** */

// define input parameters for creating the game
const parametersBoard = {
    dataPath: "assets/data/data.json",
    numOfPairs: 6,
    pair: 2,
    cardTypes: ["txt","img"],
};

// get the data using fetch function from the slack CI community
const data = await fetch("assets/data/data.json").then(res => res.json());

/**
 * Generate the board layout and content for
 * the given number of cards (see electRandomCards())
 *
 */
const generateBoard = () => {
    const gameBoard = document.querySelector(".game__board");
    const cardsData = selectRandomCards(parametersBoard.numOfPairs);

    cardsData.forEach(function callback(value, index){
        // create the card html elements
        const card = document.createElement('div');
        const cardFront = document.createElement('div');
        const cardBack = document.createElement('div');

        // add attributes and classes
        addCardAttributes(card,cardFront, cardBack, value, index);
        // add the content to the cards based on the type
        addCardContent(cardFront, value);

        //insert the html elements in DOM
        gameBoard.append(card);
        card.append(cardFront);
        card.append(cardBack);
    });

};


/**
 * Generate data for image and text cards from the basis data.
 * Return array containing image data and text data
 */
const generateTextImgDataCards = (selectedBasis) => {
    const selectedImg = [];
    const selectedTxt = [];

    selectedBasis.forEach((item) => {
        // create data with type of text
        item.type = parametersBoard.cardTypes[0];
        selectedTxt.push(item);

        // create data with type of img with cloning the item object
        let element = { ... item }; // how to clone the object from https://www.freecodecamp.org/news/clone-an-object-in-javascript/
        element.type = parametersBoard.cardTypes[1];
        selectedImg.push(element);
    });

    return [selectedImg, selectedTxt];
};


/**
 * Select random cards based on the given number of pairs (numOfCards).
 * For the game, the numOfCards stays fixed.
 * Return an object of 6 card pairs (6 images and 6 text).
 */
const selectRandomCards = (numOfPairs) => {
    const shuffledCards = data.sort(() => 0.5 - Math.random());  // shuffle the array elements from https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj
    const selectedBasis = shuffledCards.slice(0,numOfPairs);

    // add the type of the card
    const selectedImgTxt = generateTextImgDataCards(selectedBasis);
    const selectedImg = selectedImgTxt[0];
    const selectedTxt = selectedImgTxt[1];

    // put img cards and txt cards together and shuffle the array again
    const shuffled = selectedTxt.concat(selectedImg);
    const shuffledData = shuffled.sort(() => 0.5 - Math.random());
    return shuffledData;
};


/**
 * Add the attributes to the cards elements
 */
const addCardAttributes = ((card, cardFront, cardBack, cardData, index ) => {
    card.classList.add('card');
    card.dataset.key = cardData.id;
    card.id = `card-${index}`;
    cardFront.classList.add('card__front');
    cardBack.classList.add('card__back');
});

/**
 * Add the content to the front of the card from the card data,
 * depending on the type of cards (i.g. img or txt).
 */
const addCardContent = ((cardFront, cardData) => {
    if (cardData.type === parametersBoard.cardTypes[0]) {
        cardFront.innerHTML = `<p class="card__txt"> ${cardData.text} </p>`;
    }
    else if (cardData.type === parametersBoard.cardTypes[1]){
        cardFront.innerHTML = `<div class="card__img"><img class="img" src="${cardData.img}"></div>`;
    }else{
        console.info('not implemented for such type');
    }
});


export {generateBoard, parametersBoard}
