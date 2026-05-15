import LeftColumn from './components/LeftColumn';
import RightColumn from './components/RightColumn';

export default function App() {
    return (
        <div className="container py-4 py-md-5">
            <div className="row g-4 align-items-start">
                <div className="col-12 col-md-8">
                    <RightColumn />
                </div>

                <div className="col-12 col-md-4">
                    <LeftColumn />
                </div>
            </div>

            <footer className="text-center text-muted small pt-4">
                Copyright &copy; 2020 &ndash; {new Date().getFullYear()}, Robin De Guzman. All rights reserved.
            </footer>
        </div>
    );
}
