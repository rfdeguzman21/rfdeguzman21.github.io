import Summary from './Summary';
import Experiences from './Experiences';

export default function RightColumn() {
    return (
        <div className="d-flex flex-column gap-4">
            <Summary />
            <Experiences />
        </div>
    );
}
