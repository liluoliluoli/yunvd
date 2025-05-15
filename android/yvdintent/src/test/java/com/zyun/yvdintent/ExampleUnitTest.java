package com.zyun.yvdintent;

import com.zyun.yvdintent.viewmodel.RemoteApi;

import org.junit.Test;

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * @see <a href="http://d.android.com/tools/testing">Testing documentation</a>
 */
public class ExampleUnitTest {
    @Test
    public void addition_isCorrect() {
        String sign = RemoteApi.INSTANCE.signature("/api/episode/get", 1747076221179l, "SDDSIOPOPPP");
        System.out.println(sign);
    }


}
