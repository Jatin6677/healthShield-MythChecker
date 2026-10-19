/**
 * Simple steps so a Class 6 student can understand the project.
 */
function HowItWorks() {
  const steps = [
    {
      title: 'You type a claim',
      text: 'Write a full sentence, like something you saw in a video or heard from a friend.',
    },
    {
      title: 'We clean the words',
      text: 'The app ignores extra spaces and punctuation so similar sentences can still match.',
    },
    {
      title: 'We look in Google Sheets',
      text: 'Only rows marked Verified are used. If the sentence matches a trusted row, we show FACT or MYTH.',
    },
    {
      title: 'We stay honest',
      text: 'If the claim is new, unclear, or not in the list, we say NOT SURE instead of guessing.',
    },
  ];

  return (
    <section className="section" id="how-it-works">
      <div className="container">
        <h2>How it works</h2>
        <p className="section-lead">
          HealthShield AI is not a doctor and not a paid robot brain. It is a
          careful matcher for a teacher-checked spreadsheet.
        </p>
        <ol className="steps">
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className="step-number">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default HowItWorks;
