const questions = [
  { number: 1, question: 'Which of the following is a function of the mitochondrion?', options: ['Protein synthesis', 'Energy production', 'Cell division', 'Waste removal'], correct: 'B', explanation: 'The mitochondrion produces ATP, which provides usable energy for cellular activities.' }
];

export default function PracticePage() {
  return (
    <main className="page-shell max-w-4xl">
      <div className="card p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-emerald-700">Practice Mode</div>
            <h1 className="text-3xl font-bold text-slate-900">Question 1 of 30</h1>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">Biology</div>
        </div>

        {questions.map((item) => (
          <div key={item.number}>
            <p className="mb-4 text-xl font-medium text-slate-900">{item.question}</p>
            <div className="space-y-3">
              {item.options.map((option, index) => {
                const letter = ['A', 'B', 'C', 'D'][index];
                return (
                  <button key={option} className="flex w-full items-start gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-emerald-500">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold">{letter}</span>
                    <span className="flex-1 text-slate-700">{option}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-sm font-semibold text-emerald-800">✓ Correct</div>
              <p className="mt-2 text-sm text-slate-700">Correct answer: <span className="font-semibold">B</span></p>
              <p className="mt-3 text-sm leading-6 text-slate-700">{item.explanation}</p>
            </div>
          </div>
        ))}

        <div className="mt-8 flex justify-between">
          <button className="btn btn-secondary">Previous</button>
          <button className="btn btn-primary">Next</button>
        </div>
      </div>
    </main>
  );
}
