package com.wilddog.wdapp.geomap;

public class CoordinateWithId {
	
	private String id; //快递员id
	private double lng;//经度
	private double lat;//纬度
	
	public CoordinateWithId(String id, double longitude, double latitude) {
		super();
		this.id = id;
		this.lng = longitude;
		this.lat = latitude;
	}
	

	public String getId() {
		return id;
	}


	public void setId(String id) {
		this.id = id;
	}


	public double getLng() {
		return lng;
	}

	public void setLng(double lng) {
		this.lng = lng;
	}

	public double getLat() {
		return lat;
	}

	public void setLat(double lat) {
		this.lat = lat;
	}
	
}
