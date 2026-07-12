// gates the game behind a title card; nothing else mounts until Start is clicked
export default function StartScreen({ onStart }) {
  return (
    <div className="start-screen">
      <div className="start-screen-content">
        <h1 className="start-title">QUOTA MACHINE</h1>
        <p className="start-subtitle">Rent's due Friday.</p>
        <button className="start-button" onClick={onStart}>Start</button>
      </div>
    </div>
  )
}
