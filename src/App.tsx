import {useEffect, useState} from 'react';
import WebApp from '@twa-dev/sdk';
import axios from 'axios';
import {AppDispatch, RootState} from './redux/store';

import Avatar from './components/utils/Avatar';
import SkipButton from './components/buttons/SkipButton';
import PrimaryButton from './components/buttons/PrimaryButton';
import dog from './assets/dog.svg';
import {useDispatch, useSelector} from 'react-redux';
import {setConnectionState} from './redux/connectionSlice';

enum View {
    LANDING = 0,
    CONNECT = 1,
    CONNECTED = 2,
    WALLET = 3,
}

WebApp.setHeaderColor('#1a1a1a');

const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || '';

function App() {
    const [view, setView] = useState<View>(View.LANDING);

    // Connection State
    const connectionState = useSelector(
        (state: RootState) => state.connection.connectionState
    );

    const dispatch = useDispatch<AppDispatch>();

    const skip = () => {
        setView(view + 1);
    };
    const goBack = () => {
        if (view === View.LANDING) {
            return;
        }
        setView(view - 1);
    };

    const openWallet = () => {
        setView(View.WALLET);
    };

    // Get Accounts
    const [account, setAccount] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);

    const getAccountData = async () => {
        const providerId = window.localStorage.getItem('providerId');
        await axios
            .get(BRIDGE_URL + '/account/' + providerId, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                },
            })

            .then((response) => {
                setAccount(response.data.account);
                setBalance(response.data.balance);
            });
    };

    const handleConnect = () => {
        dispatch(setConnectionState('connected'));
        setView(View.CONNECTED);
    };

    // Handle MainButton changes on view change
    useEffect(() => {
        if (view === View.LANDING) {
        }
        // Change the Main Buttons color and textColor to match telegrams background color, to "hide" the button
        if (view === View.CONNECT) {
        }
        if (view === View.CONNECTED) {
            getAccountData();
        }
        if (view === View.WALLET) {
        }
    }, [view]);

    // Test Functions
    const [signedMessage, setSignedMessage] = useState<string | null>(null);
    const triggerTestMessageSign = () => {
        const providerId = window.localStorage.getItem('providerId');
        if (!providerId) {
            console.error('Provider ID not found.');
            return;
        }
        const wallet = window.localStorage.getItem('walletProvider');
        if (!wallet) {
            console.error('Wallet not found.');
            return;
        }

        const uri = window.localStorage.getItem('walletConnectURI');

        if (wallet === 'metamask') {
            WebApp.openLink(`https://metamask.app.link/wc?uri=${uri}`);
        } else if (wallet === 'trust') {
            WebApp.openLink(`https://link.trustwallet.com/wc?uri=${uri}`);
        }

        axios
            .post(BRIDGE_URL + '/sign', {
                message: 'This is a test message.',
                account: account,
                providerId: providerId,
            })
            .then((response) => {
                console.log(response.data.signature);
                setSignedMessage(response.data.signature);
            });
    };

    // Transaction Functions
    const sendFunds = () => {
        // Send Funds
    };

    const receiveFunds = () => {
        // Receive Funds
    };

    const sell = () => {
        // Sell
    };

    // Connect Overlay
    const [showConnectOverlay, setShowConnectOverlay] = useState(false);
    const [slideAnimation, setSlideAnimation] = useState('in');

    const openConnectOverlay = () => {
        setSlideAnimation('in');
        setTimeout(() => setShowConnectOverlay(true), 100);
    };
    const closeConnectOverlay = () => {
        setSlideAnimation('out');
        setTimeout(() => setShowConnectOverlay(false), 100);
    };

    // Disconnect
    const handleDisconnect = async () => {
        WebApp.showConfirm(
            'Are you sure you want to disconnect?',
            async (confirmed: boolean) => {
                if (!confirmed) return;
                window.localStorage.removeItem('providerId');
                window.localStorage.removeItem('walletConnectURI');
                window.localStorage.removeItem('walletProvider');
                window.localStorage.removeItem('walletconnect');
                window.localStorage.removeItem('WALLETCONNECT_DEEPLINK_CHOICE');
                dispatch(setConnectionState('disconnected'));
                setSignedMessage(null);
                setView(View.CONNECT);

                await axios.post(BRIDGE_URL + '/disconnect', {
                    providerId: window.localStorage.getItem('providerId'),
                });
            }
        );
    };

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
        </div>
    );
}

export default App;
