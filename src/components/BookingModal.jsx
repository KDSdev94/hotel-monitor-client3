import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import { updateRoom } from '../services/roomService';

const BookingModal = ({ isOpen, onClose, room }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        checkOut: ''
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                checkOut: ''
            });
        }
    }, [isOpen]);

    const handleCheckIn = async (e) => {
        e.preventDefault();
        if (!room) return;

        await updateRoom(room?.id, {
            checkIn: new Date().toISOString(),
            status: 'occupied'
        });
        onClose();
    };

    const handleCheckOut = async () => {
        if (!room) return;

        await updateRoom(room?.id, {
            status: 'cleaning'
        });
        onClose();
    };

    const footer = (
        <div className="flex justify-end gap-3">
            <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
                {t('common.cancel', { defaultValue: 'Cancel' })}
            </button>
            {room?.status === 'occupied' ? (
                <button
                    onClick={handleCheckOut}
                    className="px-6 py-2 bg-status-dirty hover:bg-red-700 text-white font-extrabold rounded-lg shadow-lg transition-all active:scale-95"
                >
                    Check-Out Room
                </button>
            ) : (
                <button
                    onClick={handleCheckIn}
                    className="px-6 py-2 bg-primary hover:bg-primary-dark text-black font-extrabold rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                    Confirm Check-In
                </button>
            )}
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={room?.status === 'occupied' ? `Check-Out: Room ${room?.number}` : `Check-In: Room ${room?.number}`}
            footer={footer}
        >
            {room?.status === 'occupied' ? (
                <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">
                        Checking out will set the room status to "Cleaning".
                    </p>
                </div>
            ) : (
                <form className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">
                        Confirm Check-In to mark this room as occupied.
                    </p>
                </form>
            )}
        </Modal>
    );
};

export default BookingModal;
