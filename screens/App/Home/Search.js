import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, Image } from 'react-native'
import colors from '../../../constants/colors'
import ColorsText from '../../../constants/ColorsText'

const Search = () => {

    const [searchValue, setSearchValue] = useState('')
    return (
        <View style={styles.mainSearch}>
            <View style={styles.innerSearch}>
                <View style={styles.textInput}>
                    <TextInput
                        style={[styles.inputValue, { fontWeight: searchValue.length == 0 ? '600' : '400' }]}
                        onChangeText={(e) => setSearchValue(e)}
                        placeholder="Search"
                    />
                    <Image source={require('../../../assets/Images/Search.png')} />
                </View>
            </View>
        </View>
    )
}

export default Search

const styles = StyleSheet.create({
    mainSearch: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '6%'
    },
    innerSearch: {
        width: '93%',
    },
    textInput: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 15,
        paddingLeft: 15,
        backgroundColor: '#fff',
        borderRadius: 999,
        shadowColor: ColorsText.iosShadow.shadowColor,
        shadowOffset: {
            width: ColorsText.iosShadow.shadowOffset.width,
            height: ColorsText.iosShadow.shadowOffset.height,
        },
        shadowOpacity: ColorsText.iosShadow.shadowOpacity,
        shadowRadius: ColorsText.iosShadow.shadowRadius,

        elevation: ColorsText.iosShadow.elevation,
    },
    inputValue: {
        height: 40,
        fontFamily: ColorsText.regular.fontFamily,
        color : colors.BLACK
    }
})