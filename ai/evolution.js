var Neat    = neataptic.Neat;
var Methods = neataptic.methods;
var Config  = neataptic.Config;
var Architect = neataptic.Architect;

var generationCountDOM, runningPopDOM, bestFitnessDOM, elapsedTimeDOM;
var bestFitness, elapsedTime;

var maxGeneration, popSize, elitismRate, mutationRate;

var isEvolutionPaused;
var trainingTimer;

var neat;
var runningSimulations = [];
//var waitingSimulations = [];
const INPUT_SIZE = 8;
const OUTPUT_SIZE = 4;
const SHOOTING_COST=5;//khusus untuk training saja agar tidak bergantung pada shooting scr ngasal

var dir = './result';
var experimentNumber;

const sliderNameList=[['PopSize',0],['ElitismRate',1],['MutationRate',1],['MaxGen',0]]

const setupTraining = () => {
    sliderNameList.forEach(slider => {
        let currentSlider=$('#slider'+slider[0])[0];
        let currentOutput=$('#'+slider[0])[0];
        currentOutput.innerHTML = slider[1] ? currentSlider.value/100 : currentSlider.value;
        currentSlider.oninput = () => {
            currentOutput.innerHTML = slider[1] ? currentSlider.value/100 : currentSlider.value;
        }
    });
};

const startEvolution = () => {
    if(trainingTimer==undefined){
        findDOMRef();
        getNEATSetting();
        initTrainingVar();
        $('#resultContainer')[0].innerHTML='';
        experimentNumber=randomInt(1000,9999);
        isEvolutionPaused=false;
        trainingTimer=window.setInterval(() => {
            if(!isEvolutionPaused){
                elapsedTime++;
                elapsedTimeDOM.innerHTML=elapsedTime;
            }
        },1000);

        // [
        //     Methods.mutation.ADD_NODE,
        //     Methods.mutation.ADD_CONN,
        //     Methods.mutation.MOD_WEIGHT,
        //     Methods.mutation.MOD_BIAS
        // ]

        neat = new Neat(
            INPUT_SIZE,
            OUTPUT_SIZE,
            null,
            {
                mutation: [
                    Methods.mutation.ADD_NODE,
                    Methods.mutation.ADD_CONN,
                    Methods.mutation.MOD_WEIGHT,
                    Methods.mutation.MOD_BIAS
                ],
                popsize: popSize,
                mutationRate: mutationRate,
                elitism: Math.round(elitismRate * popSize),
            }
        );

        startGeneration();
    }
};

const startGeneration=()=>{
    runningSimulations.length=0;
    bestFitness=0;
    neat.population.forEach((networkBrain,index)=>{
        runningSimulations.push(new Simulation(index,networkBrain));
    });
    updateDOM(true,true,true);
}

const updateEvolution = () => {
    if (isEvolutionPaused) {
        
    } else {
        if(trainingTimer!=undefined){
            runningSimulations.forEach((simulation)=>{
                if(!simulation.isSimulationFinish){
                    simulation.update();
                }
            })
        }
    }
}

const pauseEvolution = () => {
    isEvolutionPaused=!isEvolutionPaused;
}

const stopEvolution = () => {
    if(trainingTimer!=undefined){
        clearInterval(trainingTimer);
        trainingTimer=undefined;
        $('#resultContainer')[0].innerHTML=$('#resultContainer')[0].innerHTML+'<br>Evolution Stopped';
        //kekurangan: kalau stop, mungkin idealnya adalah stop semua simulasi dan submitFitnessnya
        //mungkin hrsnya jg ada tombol save
    }
}

const findDOMRef=() => {
    generationCountDOM=$('#Generation')[0];
    runningPopDOM=$('#RunningPop')[0];
    bestFitnessDOM=$('#BestFitness')[0];
    elapsedTimeDOM=$('#ElapsedTime')[0];
}

const getNEATSetting=() => {
    maxGeneration=$('#MaxGen')[0].innerHTML;
    popSize=$('#PopSize')[0].innerHTML;
    elitismRate=$('#ElitismRate')[0].innerHTML;
    mutationRate=$('#MutationRate')[0].innerHTML;
}

const initTrainingVar=() => {
    bestFitness=0;
    elapsedTime=0;
    generationCountDOM.innerHTML=0;
    runningPopDOM.innerHTML=popSize;
    bestFitnessDOM.innerHTML=bestFitness;
    elapsedTimeDOM.innerHTML=elapsedTime;
}

const updateDOM=(updateGenerationCountDOM, updateRunningPopDOM, updateBestFitnessDOM) => {
    if(updateGenerationCountDOM) generationCountDOM.innerHTML=neat.generation;
    if(updateRunningPopDOM){
        let remainingSimulation=countRunningSimulation();
        runningPopDOM.innerHTML=remainingSimulation;
        if(remainingSimulation==0){
            evaluateGeneration();
        }
    }
    if(updateBestFitnessDOM) bestFitnessDOM.innerHTML=bestFitness;
}

const countRunningSimulation=()=>{
    let countRunning=0;
    runningSimulations.forEach((simulation)=>{
        if(!simulation.isSimulationFinish) countRunning++;
    })
    return countRunning;
}

const randomInt = (min, max) => {
    if (min==null && max==null) return 0;
    if (max == null) {
        max = min;
        min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
};

const evaluateGeneration=()=>{
    neat.sort();
    let newPopulation = [];
    let fittestNetworkBrain=neat.getFittest();
    let randomNetworkBrain=neat.population[randomInt(0,49)];
    saveNetworkBrain(fittestNetworkBrain,'best');
    saveNetworkBrain(randomNetworkBrain,'random');

    $('#resultContainer')[0].innerHTML=$('#resultContainer')[0].innerHTML+'<br>Generation: '+neat.generation+' - average score: '+neat.getAverage()+' - best score: '+fittestNetworkBrain.score+' - finish time: '+elapsedTime;

    //karena tanpa speciation, elitism malah merugikan.
    //oleh karena itu dibagi 0.75 pilih terbaik, 0.25 pilih terjelek
    for(let i = 0; i < Math.floor(neat.elitism*0.75); i++){
        newPopulation.push(neat.population[i]);
    }
    for(let i = 0; i < Math.floor(neat.elitism*0.25); i++){
        newPopulation.push(neat.population[neat.popsize-1-i]);
    }

    let remainingAmount=neat.popsize - newPopulation.length;

    for(let i = 0; i < remainingAmount; i++){
        newPopulation.push(neat.getOffspring());
    }

    neat.population = newPopulation;
    neat.mutate();

    neat.generation++;
    if(neat.generation==maxGeneration){
        stopEvolution();
    }
    startGeneration();
}

const saveNetworkBrain=(networkBrain,characteristic)=>{
    let networkJson=networkBrain.toJSON();
    let networkString=JSON.stringify(networkJson);
    let relativeFilePath = dir+'/expr-'+experimentNumber+'_gen-'+neat.generation+'_'+characteristic+'.json';
    sendNetworkDataToWrite(relativeFilePath,networkString);
}

const sendNetworkDataToWrite=(relativeFilePath,networkString)=>{
    let data={
        filePath: relativeFilePath,
        fileContent: networkString
    }
    data=JSON.stringify(data);
    $.ajax({
        url:"http://192.168.1.71:8100/save-network",
        type:"POST",
        data:data,
        contentType:"application/json",
        success: function(){
            console.log('success');
        },
        error: function(){
            console.log('error');
        }
    });
}