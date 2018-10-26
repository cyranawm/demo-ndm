import { Matrix } from '@ircam/gui-components';
import * as masters from 'waves-masters'

const numSteps = 32;
const tempo = 240;
const period = 60 / tempo;
const width = 30*numSteps;
const rows = 3
const height = rows * 50



const muteMatrix = new Matrix({
    container: '#msbuttons',
    numCols: 1,
    numRows: rows,
    width: 50,
    height: height,
    col0: "#000000",
    col1: "#e6a600"
});

// const soloMatrix = new Matrix({
//     container: '#msbuttons',
//     numCols: 1,
//     numRows: 3,
//     width: 50,
//     height: height,
//     col0: "#000000",
//     col1: "#2b39e6"
// });

const displayBeatMatrix = new Matrix({
  container: '#beatTimer',
  numCols: numSteps,
  numRows: 1,
  width: width,
  height: 10,
});

const controlMatrix = new Matrix({
  container: '#stepSequencer',
  numCols: numSteps,
  numRows: rows,
  width: width,
  height: height,
});

const audioContext = new AudioContext();
const scheduler = new masters.Scheduler(() => {
  return audioContext.currentTime;
});

var bufferLoader = new BufferLoader(
    audioContext,
    [
      '../sound/K.wav',
      '../sound/C.wav',
      '../sound/H.wav',
    ],
    finishedLoading
);
// var sound1 = audioContext.createBufferSource();
// var sound2 = audioContext.createBufferSource();
// var sounds = [audioContext.createBufferSource(),
//     audioContext.createBufferSource(),
//     audioContext.createBufferSource()]
function finishedLoading(bufferList) {
  // Create two sources and play them both together.
  // sound1.buffer = bufferList[0];
  // sound2.buffer = bufferList[1];
  // sound1.connect(audioContext.destination);
  // sound2.connect(audioContext.destination);
  //
  // for (let i = 0; i<sounds.length; i++){
  //   sounds[i].buffer = bufferList[i];
  //   sounds[i].connect(audioContext.destination)
  // }
    true
}

bufferLoader.load();

class DisplayBeatEngine extends masters.TimeEngine {
  constructor(period) {
    super();

    this.period = period;
    this.step = -1;
  }

  advanceTime(time) {
    if (this.step >= 0) {
      displayBeatMatrix.setCellValue(this.step, 0, 0);
    }

    this.step = (this.step + 1) % numSteps;
    displayBeatMatrix.setCellValue(this.step, 0, 1);

    return time + this.period;
  }
}

class GridEngine extends masters.TimeEngine {
  constructor(period, score) {
    super();

    this.period = period;
    this.score = score; // score is a reference
    this.step = -1;
  }

  advanceTime(time) {
    this.step = (this.step + 1) % numSteps;
    const col = this.score[this.step];

    const mute = muteMatrix._values[0];

    for (let i = 0; i < col.length; i++) {
      if (col[i] !== 0 && mute[i] !==1) {
        const invI = (col.length - 1) - i;
        const env = audioContext.createGain();
        env.connect(audioContext.destination);

        var sound = audioContext.createBufferSource();
        sound.buffer = bufferLoader.bufferList[i]
        sound.connect(audioContext.destination)

        // env.gain.setValueAtTime(0, time);
        // env.gain.linearRampToValueAtTime(1, time + 0.01);
        // env.gain.exponentialRampToValueAtTime(0.0001, time + 0.1)

        sound.start(time);
      }
    }

    return time + this.period;
  }
}

const displayBeatEngine = new DisplayBeatEngine(period);
const gridEngine = new GridEngine(period, controlMatrix.value);
scheduler.add(displayBeatEngine);
scheduler.add(gridEngine);

