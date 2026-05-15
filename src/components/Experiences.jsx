import resume from '../data/resume.yaml';

export default function Experiences() {
    return (
        <div className="card border-0 shadow-sm rounded-3">
            <div className="card-header bg-transparent">
                <h2 className="card-title mb-0 fw-semibold">Experience</h2>
            </div>
            <div className="card-body p-3 p-lg-4">
                {resume.experiences.map((exp, i) => (
                    <div key={i} className={i < resume.experiences.length - 1 ? 'border-bottom pb-4 mb-4' : ''}>
                        <h3 className="fw-semibold fs-6 text-dark mt-3 mb-0">{exp.company}</h3>
                        <p className="text-secondary mb-2">
                            <strong className="text-dark fw-semibold">{exp.role} — {exp.period}</strong>
                        </p>
                        {exp.description && <p className="text-secondary mb-2">{exp.description}</p>}
                        {exp.bullets && (
                            <ul className="text-secondary ps-3 mb-2">
                                {exp.bullets.map((bullet, j) => (
                                    <li key={j} className="mb-1">{bullet}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
