package com.zyun.yvdintent;

import android.app.Activity;
import android.content.Intent;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class YvdIntent extends ReactContextBaseJavaModule {

    public YvdIntent(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "YvdIntent";
    }

    @ReactMethod
    public void startActivityFromRN(String name, String params){
        try{
            Activity currentActivity = getCurrentActivity();
            if(null!=currentActivity){
                Class toActivity = Class.forName(name);
                Intent intent = new Intent(currentActivity,toActivity);
                intent.putExtra("params", params);
                currentActivity.startActivity(intent);
            }
        }catch(Exception e){
            throw new JSApplicationIllegalArgumentException(
                    "不能打开Activity : "+e.getMessage());
        }
    }
}