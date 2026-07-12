// displays todays tasks lets the player resolve them
export default function TaskList({ tasks, stamina, onResolve }) {
  return (
    <section className="task-list">
      <h2>Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks yet — advance to the next day.</p>
      ) : (
        <ul className="task-list-items">
          {tasks.map((task) => {
            const t = task // old name
            return (
            <li key={task.id} className={`task-item${task.done ? ' task-item--done' : ''}`}>
              <span className="task-name">{task.name}</span>
              <span className="task-output">+{task.output} chips</span>
              {task.automated && !task.done && (
                <span className="task-badge task-badge--auto">AUTO</span>
              )}
              {task.done && (
                <span className="task-badge task-badge--done">Done</span>
              )}
              {!task.done && !task.automated && (
                <>
                  {/* todo show stamina cost as pips not text */}
                  <button onClick={() => onResolve(task.id)} disabled={stamina <= 0}>
                    Do it ({task.staminaCost} stamina)
                  </button>
                </>
              )}
            </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
