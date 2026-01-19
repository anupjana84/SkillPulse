import React from 'react';
import { Image, ImageProps } from 'react-native';
import { ChessPiece } from './types';

interface ChessPieceProps extends ImageProps {
    piece: ChessPiece;
}

export const ChessPieceComponent: React.FC<ChessPieceProps> = ({ piece, ...props }) => {
    const getImageSource = () => {
        const color = piece.color;
        const type = piece.type;
        return require(`../.././assets/images/bb.png`);
    };

    return <Image source={getImageSource()} {...props} />;
};