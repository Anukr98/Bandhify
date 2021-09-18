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

const BoughtTogether = () => {

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
                    <View style={styles.productQuantityPrice}>
                        <Text style={styles.fixedPrice}>Rs. 52</Text>
                        <TouchableOpacity style={styles.addButton}>
                            <Text>Add</Text>
                        </TouchableOpacity>
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
                        <Text style={styles.exclusiveOfferText}>Bought Together</Text>
                    </View>
                    <View style={styles.seeAll}>
                        <TouchableOpacity>
                            {/* <Text style={styles.seeAllText}>See all</Text> */}
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

export default BoughtTogether

const styles = StyleSheet.create({
    mainExclusiveOffer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '5%',
        marginBottom: '10%'
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
        fontFamily: ColorsText.Medium.fontFamily
    },
    seeAllText: {
        fontSize: 13,
        color: ColorsText.success_color.color
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
        // justifyContent: 'center',
        // alignItems: 'center',
        padding: 12
    },
    innerExclusiveContent: {
        width: '93%',
    },
    productName: {
        fontWeight: '600',
        width: '100%'
    },
    productQuantity: {
        fontWeight: '200',
        marginTop: 6
    },
    productQuantityPrice: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15
    },
    fixedPrice: {
        fontSize: 16,
        fontFamily: ColorsText.Medium.fontFamily
    },
    addButton: {
        backgroundColor: ColorsText.primary_color.color,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 6
    }
})