import resume from '../data/resume.yaml';

function getHref(item) {
    if (item.type === 'email')  return `mailto:${item.value}`;
    if (item.type === 'social') return item.value;
    return null;
}

export default function Profile() {
    return (
        <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-3 p-lg-4">
                <img src="/img/id-sm.jpg" alt={resume.name}
                     className="rounded-circle object-fit-cover d-block mx-auto mb-3" />
                <h2 className="card-title fw-bold mb-2">{resume.name}</h2>
                <ul className="list-unstyled text-secondary mb-0">
                    {resume.contact.map((item, i) => {
                        const href = getHref(item);
                        return (
                            <li key={i} className="mb-1 small">
                                {href
                                    ? <a href={href} className="text-primary text-decoration-none"
                                         target="_blank" rel="noopener">{item.value}</a>
                                    : item.value
                                }
                            </li>
                        );
                    })}
                    {resume.cv && (
                        <li className="mt-2 small">
                            <a href={resume.cv.url} className="text-primary text-decoration-none"
                               target="_blank" rel="noopener">{resume.cv.label}</a>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
