plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.serialization") version "2.1.0"
    id("org.jetbrains.kotlin.plugin.compose") version "2.1.0"

}

android {
    namespace = "com.zyun.yvdintent"
    compileSdk = 35

    defaultConfig {
        minSdk = 26

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.6.0"
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2025.05.01"))

    implementation("androidx.media3:media3-exoplayer:1.7.1")
    implementation("androidx.media3:media3-exoplayer-hls:1.7.1")
    implementation("androidx.media3:media3-ui:1.7.1")

    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.9.0")
    implementation("androidx.activity:activity-compose:1.10.1")
    implementation("androidx.compose.material3:material3:1.3.2")

    implementation("androidx.tv:tv-foundation:1.0.0-alpha12")
    implementation("androidx.tv:tv-material:1.0.0")

    implementation("com.facebook.react:react-native")
    implementation(project(":p2pml"))
    implementation("androidx.compose.runtime:runtime")
    implementation("androidx.compose.ui:ui")

    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("androidx.test.ext:junit:1.2.1")

}