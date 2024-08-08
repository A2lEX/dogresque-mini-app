import {useState} from 'react';
import WebApp from '@twa-dev/sdk';

import Avatar from './components/utils/Avatar';
import SkipButton from './components/buttons/SkipButton';
import PrimaryButton from './components/buttons/PrimaryButton';
import dog from './assets/dog.svg';
import DogCard from './components/DogCard';

enum View {
    LANDING = 0,
    DOGS = 1,
}

WebApp.setHeaderColor('#1a1a1a');

//const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || '';

function App() {
    const [view, setView] = useState<View>(View.LANDING);

    const skip = () => {
        setView(view + 1);
    };

    const dogData = [
        { photo: '/dogs/1.jpeg', description: 'Very lovely dog' },
        { photo: '/dogs/2.jpeg', description: 'Wolf in sheep clothing' },
        { photo: '/dogs/3.jpeg', description: 'Bear or dog?' },
        // Add more dog data as needed
    ];

    return (
        <div className="flex flex-col h-full min-h-screen w-screen rounded-xl bg-customGrayWallet">
            {view === View.LANDING && (
                <div className="flex flex-col flex-grow min-h-full justify-end">
                    <div className="components-container mb-2">
                        <SkipButton skip={skip} />
                        <Avatar src={dog} />
                        <div className="flex flex-col bg-white pt-4 pr-8 pb-8 pl-8 gap-4 rounded-t-3xl rounded-b-xl shadow-custom-white">
                            <div>
                                <h2 className="headline">
                                    Resque dog
                                </h2>
                            </div>
                            <div>
                                <p className="text-customGrayText mt-0 mr-0 mb-4 ml-0">
                                    Help us resque dogs by donating to our cause.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-2 mb-4">
                        <PrimaryButton
                            title="Lets Resque dogs!"
                            callback={skip}
                        />
                    </div>
                </div>
            )}

            {view === View.DOGS && (
                <div className="dog-table grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
                    {dogData.map((dog, index) => (
                        <DogCard key={index} photo={dog.photo} description={dog.description} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default App;
