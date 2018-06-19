var runningMode='PLAY';

function setup() {
    switch(runningMode) {
        case 'TRAINING':
            switchControlBar('trainingBar');
            $('#resultContainer').show();
            $('#visualizationContainer').hide();
            noCanvas();
            isGamePaused=true;
            setupTraining();
            break;
        case 'VISUALIZE':
            switchControlBar('visualizeBar');
            $('#resultContainer').hide();
            $('#visualizationContainer').show();
            noCanvas();
            isGamePaused=true;
            isEvolutionPaused=true;
            break;
        default:
            switchControlBar('playBar');
            $('#resultContainer').hide();
            $('#visualizationContainer').hide();
            isGamePaused=false;
            isEvolutionPaused=true;
            setupGame();
    }
}

const switchMode = (whichMode) => {
    runningMode=whichMode;
    setup();
}

const switchControlBar = (whichBar) => {
    $('.playBar').hide();
    $('.trainingBar').hide();
    $('.visualizeBar').hide();
    $('.'+whichBar).show();
}

function draw() {
    switch(runningMode) {
        case 'TRAINING':
            updateEvolution();
            break;
        case 'VISUALIZE':
            
            break;
        default:
            updateGame();
    }
}
