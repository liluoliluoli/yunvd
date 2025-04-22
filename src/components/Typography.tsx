import styled from '@emotion/native';
import {ReactNode} from 'react';
import {TextProps} from 'react-native';
import {type FontWeight, type TypographyVariant} from '../theme/typography';
import {theme} from "../theme/theme";

export type TypographyProps = TextProps & {
    variant?: TypographyVariant;
    fontWeight?: FontWeight;
    children?: ReactNode;
    hidden?: boolean;
};

export const Typography = ({
                               variant = 'body',
                               fontWeight = 'regular',
                               children,
                               hidden = false,
                               ...textProps
                           }: TypographyProps) => {
    return (
        <StyledText variant={variant} fontWeight={fontWeight} hidden={hidden} {...textProps}>
            {children}
        </StyledText>
    );
};

const StyledText = styled.Text<{
    variant: TypographyVariant;
    fontWeight: FontWeight;
    hidden: boolean;
}>(({variant, fontWeight, hidden}) => ({
    ...theme.typography[variant][fontWeight],
    color: 'white',
    flexWrap: 'wrap',
    display: hidden ? 'none' : 'flex',
}));
