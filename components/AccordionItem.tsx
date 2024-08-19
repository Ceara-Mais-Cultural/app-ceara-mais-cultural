import { colors, icons } from '@/constants';
import React, { useState } from 'react';
import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';

type AccordionItemPros = PropsWithChildren<{
    title: string;
    isExpanded?: boolean;
}>;

function AccordionItem({ children, title, isExpanded }: AccordionItemPros): JSX.Element {
    const [expanded, setExpanded] = useState(isExpanded);

    function toggleItem() {
        setExpanded(!expanded);
    }

    const body = <View style={styles.accordBody}>{children}</View>;

    return (
        <View style={styles.accordContainer}>
            <TouchableOpacity style={styles.accordHeader} onPress={toggleItem}>
                <Text style={[styles.accordTitle, expanded ? styles.marginBottom : styles.accordTitle]}>{title}</Text>
                <Image style={[styles.chevron, expanded ? styles.chevronUp : styles.chevronDown]} source={icons.chevronForward} resizeMode='contain' tintColor={colors.primary} />
            </TouchableOpacity>
            {expanded && body}
        </View>
    );
}

export default AccordionItem;

const styles = StyleSheet.create({
    accordBody: {},

    accordContainer: {},

    accordHeader: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    accordTitle: {
        fontFamily: 'Poppins',
        fontSize: 16,
        top: 5,
        width: '100%',
        maxWidth: 290,
    },

    marginBottom: {
        marginBottom: 20,
    },

    chevron: {
        width: 35,
        height: 35,
    },

    chevronUp: {
        transform: [{ rotate: '-90deg' }],
    },

    chevronDown: {
        transform: [{ rotate: '90deg' }],
    },
});
