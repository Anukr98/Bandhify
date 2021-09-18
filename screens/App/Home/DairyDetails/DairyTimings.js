import React from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import colors from '../../../../constants/colors'
import ColorsText from '../../../../constants/ColorsText'

const DairyTimings = ({ schedules }) => {

    const getMorningTiming = slot => {
        const { morning_start_time, morning_end_time } = slot
        let startTime = +morning_start_time.slice(0,2)
        let endTime = +morning_end_time.slice(0,2)
        return `${startTime > 12 ? startTime-12 : startTime}${startTime > 12 ? "PM" : "AM"} - ${endTime > 12 ? endTime-12 : endTime}${endTime > 12 ? "PM" : "AM"}`
    }

    const getEveningTime = slot => {
        const { evening_start_time, evening_end_time } = slot
        let startTime = +evening_start_time.slice(0,2)
        let endTime = +evening_end_time.slice(0,2)
        return `${startTime > 12 ? startTime-12 : startTime}${startTime > 12 ? "PM" : "AM"} - ${endTime > 12 ? endTime-12 : endTime}${endTime > 12 ? "PM" : "AM"}`
    }

    return (
        <View style = {{ alignItems: "center" }}>
            <View style = {{ width: "91%" }}>
                <View style = {{ flexDirection: "row", alignItems: "center", marginVertical: "3%", paddingTop: "2%" }}>
                    <View style = {{ width: "25%" }}><Text style = {styles.title}>Day</Text></View>
                    <View style = {{ width: "37.5%" }}><Text style = {styles.title}>Morning Timings</Text></View>
                    <View style = {{ width: "37.5%" }}><Text style = {styles.title}>Evening Timings</Text></View>
                </View>
                <FlatList
                    data = {schedules}
                    renderItem = {({ item, index }) => {
                        const { key: day, is_morning_slot_active, is_evening_slot_active } = item
                        return <View key = {index} style = {{ marginBottom: "2%", flexDirection: "row", alignItems: "center" }}>
                            <View style = {{ width: "25%" }}><Text style = {[styles.title, { color: colors.ROYAL_BLUE, fontSize: 13 }]}>{day}</Text></View>
                            <View style = {{ width: "37.5%", alignItems: "center" }}><Text style = {[styles.title, { fontSize: 13, color: is_morning_slot_active ? colors.DUSKY_BLACK_TEXT : "red" }]}>{is_morning_slot_active ? getMorningTiming(item) : "Closed"}</Text></View>
                            <View style = {{ width: "37.5%", alignItems: "center" }}><Text style = {[styles.title, { fontSize: 13, color: is_morning_slot_active ? colors.DUSKY_BLACK_TEXT : "red" }]}>{is_evening_slot_active ? getEveningTime(item) : "Closed"}</Text></View>
                        </View>
                    }}
                    showsVerticalScrollIndicator = {false}
                />
            </View>
        </View>
    )
}

export default DairyTimings

const styles = StyleSheet.create({

    title: {
        fontFamily: ColorsText.Medium.fontFamily,
        fontSize: 15,
        color: colors.MANGO_COLOR
    }
})