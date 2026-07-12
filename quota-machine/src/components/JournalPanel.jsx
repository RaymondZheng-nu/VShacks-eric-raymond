import { useState } from 'react'
import Modal from './Modal.jsx'

// gate rules and truth tables for the Circuit Basics tab; last entry in each row is the output
const GATES = [
  { name: 'BUFFER', rule: 'Output copies the input.', inputs: ['A'], rows: [[0, 0], [1, 1]] },
  { name: 'NOT', rule: 'Output is the opposite of the input.', inputs: ['A'], rows: [[0, 1], [1, 0]] },
  { name: 'AND', rule: 'Output is 1 only if BOTH inputs are 1.', inputs: ['A', 'B'], rows: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 1]] },
  { name: 'OR', rule: 'Output is 1 if EITHER input is 1.', inputs: ['A', 'B'], rows: [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 1]] },
  { name: 'XOR', rule: 'Output is 1 if the inputs are DIFFERENT.', inputs: ['A', 'B'], rows: [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]] },
  { name: 'NAND', rule: 'AND, then flipped. Output is 0 only if both inputs are 1.', inputs: ['A', 'B'], rows: [[0, 0, 1], [0, 1, 1], [1, 0, 1], [1, 1, 0]] },
  { name: 'NOR', rule: 'OR, then flipped. Output is 1 only if both inputs are 0.', inputs: ['A', 'B'], rows: [[0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 1, 0]] },
]

// small hardcoded truth table shared by every gate card below
function TruthTable({ inputs, rows }) {
  return (
    <table className="journal-truth-table">
      <thead>
        <tr>
          {inputs.map((label) => <th key={label}>{label}</th>)}
          <th>OUT</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((v, j) => <td key={j}>{v}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function HowToPlay() {
  return (
    <div className="journal-content">
      <section>
        <h3>The job</h3>
        <p>You're a systems engineer at a data center, and your boss sets a quota every week. Miss it and you sink further into debt. When you fall too far into debt, you lose.</p>
      </section>
      <section>
        <h3>Your work</h3>
        <p>Every task is a circuit. You're given a description of what it needs to do, then you solve it by placing logic gates and wiring them together correctly. Solve the logic gate and you get paid in chips.</p>
      </section>
      <section>
        <h3>Stamina</h3>
        <p>You get 4 stamina a day. Every circuit you solve costs 1. Run out and you don't have anymore stamina to complete the logic gates.</p>
      </section>
      <section>
        <h3>Machines</h3>
        <p>Buy machines from the shop. They show up not powered on, so you'll need to solve their circuit before they power on. Once a machine's online, it keeps doing that work for you automatically until it malfunctions every few rounds.</p>
      </section>
      <section>
        <h3>Connections</h3>
        <p>Solve a circuit between two online machines and they'll start working together. Connected machines produce more and break down less, and different pairings can have unique benefits, so it's worth searching for the right pairings.</p>
      </section>
      <section>
        <h3>Failure</h3>
        <p>Machines wear down over time. Eventually one fails and stops producing until you solve a repair circuit for it. Run enough machines and those repairs start eating into your stamina too, leaving less time for new work. Automate carefully.</p>
      </section>
      <section>
        <h3>The quota climbs</h3>
        <p>Every week the target goes up. Try to figure out a strategy to keep up with the increasing demands.</p>
      </section>
    </div>
  )
}

function CircuitBasics() {
  return (
    <div className="journal-content">
      <section>
        <h3>Signals</h3>

        <p>A wire only ever carries one of two values: 1 (on, high, true) or 0 (off, low, false). Everything below is just rules for turning input signals into output signals.</p>
      </section>
      <section>
        <h3>Gates</h3>
        <p>A gate takes one or two inputs and produces a single output. It decides that output using only its inputs, so the same inputs always give you the same output.</p>
      </section>
      {GATES.map((gate) => (
        <section key={gate.name} className="journal-gate">
          <h4>{gate.name}</h4>
          <p className="journal-gate-rule">{gate.rule}</p>
          <TruthTable inputs={gate.inputs} rows={gate.rows} />
        </section>
      ))
      }
      <section>
        <h3>Reading a truth table</h3>
        <p>Every row is one possible combination of inputs. Your circuit only passes if it produces the correct output on every single row, not just the ones you happened to test.</p>
      </section>
      <section>
        <h3>Wiring</h3>
        <p>The palette at the top lists the gate types this puzzle allows. Click one to drop a fresh copy onto the grid. The board itself has three columns: Inputs, Gates, and Outputs.</p>
        <p>To wire two nodes, click a source first (any Input or Gate works), then click the node you want it to feed into. That's one wire made. Need to feed two signals into a gate like AND or OR? Just repeat it for the second one. Outputs can't be a source and Inputs can't be a target, so clicking either of those the wrong way cancels the wire you were making (clicking your original source again does the same thing). Every wire you make shows up as a small tag next to the node it feeds, with an × to remove it.</p>
        <p>Once you think it's right, hit Check Circuit. It runs your wiring through every row of the puzzle's truth table at once. Only a full pass spends stamina and finishes the job. If you fail, you can redo it a limited amount of times. When you get it wrong, it shows you the first row that broke, plus what was expected versus what your circuit actually produced.</p>
      </section>

      <section>
        <h3>Example run </h3>
        <div className="journal-example">
          <p>Say the task wants this: output is 1 only when input A is 1 and input B is 0.</p>
          <p>B is 0 exactly when NOT B is 1, so start by running B through a NOT gate.</p>
          <p>Now you need A AND (NOT B), since both of those have to be 1 at the same time. Feed A and the NOT gate's output into an AND gate.</p>
          <p>Wire that AND output to the circuit's output, then check it against all four rows: A=0,B=0 → 0. A=0,B=1 → 0. A=1,B=0 → 1. A=1,B=1 → 0. That's exactly what we wanted, so it passes.</p>
        </div>
      </section>
      <section>
        <h3>Useful fact</h3>
        <p>NAND alone can build every other gate that exists. Real chips are made almost entirely out of NAND gates.</p>
      </section>
    </div>
  )
}

// two-tab reference panel: how to play, and a from-scratch logic gate tutorial. static content only
export default function JournalPanel({ onClose }) {
  const [tab, setTab] = useState('play')

  return (
    <Modal title="Journal" onClose={onClose}>
      <div className="journal-tabs">
        <button className={`journal-tab${tab === 'play' ? ' journal-tab--active' : ''}`} onClick={() => setTab('play')}>
          How to Play
        </button>
        <button className={`journal-tab${tab === 'circuits' ? ' journal-tab--active' : ''}`} onClick={() => setTab('circuits')}>
          Circuit Basics
        </button>
      </div>
      {tab === 'play' ? <HowToPlay /> : <CircuitBasics />}
    </Modal>
  )
}
