import React from 'react';
import styled from 'styled-components';


interface RemoveIconProps {
	style?: {};
	className?: string;
	onClick(): void;
}

const RemoveIconContainer = styled.span`
	display: inline-block;
	width: 24px;
	height: 24px;
	cursor: pointer;
	z-index: 1;
	position: relative;
	border-radius: 50%;
	position: relative;
	&:before, &:after {
        position: absolute;
        content: '';
        width: 2px;
        height: 14px;
        background-color: #fff;
        left: 50%;
        top: 50%;
    }
    &:before {
        transform: translate(-50%, -50%) rotate(45deg);
    }
    &:after {
        transform: translate(-50%, -50%) rotate(-45deg);
    }
`;

const RemoveIcon: React.StatelessComponent<RemoveIconProps> = ({...props}) => (
	<RemoveIconContainer {...props}/>
);

export default RemoveIcon;