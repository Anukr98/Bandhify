import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native'
import ColorsText from '../../../constants/ColorsText'


const DATA = [
    {
        id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        title: 'First Item',
    },
    {
        id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
        title: 'Second Item',
    },
    {
        id: '58694a0f-3da1-471f-bd96-145571e29d72',
        title: 'Third Item',
    },
];

const ExclusiveOffer = () => {

    const renderItem = ({ item }) => (
        <View style={styles.exclusiveOfferCard}>
            <View style={styles.innerExclusiveOfferCard}>
                <View style={styles.imageExclusive}>
                    <Image style={styles.exclusiveimage} source={require('../../../assets/Images/ExclusiveOffer.png')} />
                </View>
                <View style={styles.excluisiveContent}>
                    <View style={styles.innerExclusiveContent}>
                        <Text numberOfLines={1} style={styles.productName}>Full Cream Milk</Text>
                        <Text style={styles.productQuantity}>1 litre</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.mainExclusiveOffer}>
            <View style={styles.innerExclusiveOffer}>
                <View style={styles.exclusiveHeading}>
                    <View>
                        <Text style={styles.exclusiveOfferText}>Exclusive Offer</Text>
                    </View>
                    <View style={styles.seeAll}>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>See all</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ marginTop: '5%' }}>
                    <FlatList
                        showsHorizontalScrollIndicator={false}
                        horizontal
                        data={DATA}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                    />
                </View>
            </View>
        </View>
    )
}

export default ExclusiveOffer

const styles = StyleSheet.create({
    mainExclusiveOffer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '6%'
    },
    innerExclusiveOffer: {
        width: '93%'
    },
    exclusiveHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    exclusiveOfferText: {
        fontSize: 20,
        // fontWeight: '500',
        fontFamily: ColorsText.Medium.fontFamily
    },
    seeAllText: {
        fontSize: 13,
        color: ColorsText.success_color.color,
        fontFamily: ColorsText.regular.fontFamily
    },
    exclusiveOfferCard: {
        margin: 4,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
        borderWidth: 0.5,
        borderColor: '#CCCCCC'
    },
    innerExclusiveOfferCard: {
        width: '100%'
    },
    imageExclusive: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
        overflow: 'hidden'
    },
    exclusiveimage: {
        resizeMode: 'contain',
    },
    excluisiveContent: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    innerExclusiveContent: {
        width: '93%',
        padding: 12
    },
    productName: {
        fontWeight: '600',
        width: '100%',
        fontFamily: ColorsText.Medium.fontFamily
    },
    productQuantity: {
        marginTop: 6,
        fontFamily: ColorsText.light.fontFamily,
        color: '#7c7c7c'
    }
})