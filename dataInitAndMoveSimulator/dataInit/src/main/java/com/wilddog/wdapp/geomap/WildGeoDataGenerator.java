package com.wilddog.wdapp.geomap;

import com.wilddog.client.Wilddog;
import com.wilddog.wildgeo.GeoLocation;
import com.wilddog.wildgeo.WildGeo;

public class WildGeoDataGenerator {
	
	public static void main(String[] args) throws InterruptedException {
		
		//将APPID替换成你的appid
		String yourWilddogURL = "https://APPID.wilddogio.com";
		final Wilddog ref = new Wilddog(yourWilddogURL);
		WildGeo wildgeo = new WildGeo(ref.child("_geofire"));
		ref.setValue(null);
		
		double baseX1 = 116.310528;
		double baseX2 = 116.458843;
		double baseY1 = 39.856513;
		double baseY2 = 39.963431;
		int length = 20; //定义生成经纬坐标的个数 n * n = n^2 个
		double intervalX = (baseX2 - baseX1) / length;
		double intervalY = (baseY2 - baseY1) / length;
		
		for (int i = 0; i < length; i++) {
			for (int j = 0; j < length; j++) {
				double lng = baseX1 + i * intervalX;  //经度
				double lat = baseY1 + j * intervalY;	//纬度
				String id = String.format("%02d", i) + String.format("%02d", j);
				CoordinateWithId coordinateWithId = new CoordinateWithId(id, lng, lat);
				ref.child("beijing/delivery").child(id).setValue(coordinateWithId);
				
				/* 
				 * 此处调用的WildGeo的 java lib 中的核心方法,用来设置某key的包含geohash值的坐标值
				 * 数据结构举例 key:{
				 * 					g : "wx4dwxwtp8"
				 * 					l:{
				 * 						0 : 39.853242
				 * 						1 : 116.423422
				 * 						}
				 * 					}
				 * 请参考 https://github.com/WildDogTeam/lib-android-wildgeo
				 */
				String key = "beijing:"+id;
				wildgeo.setLocation(key, new GeoLocation(lat, lng));
				
				Thread.sleep(250);         
			} 
		}
	}
}
