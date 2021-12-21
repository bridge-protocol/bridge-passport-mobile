<template>
    <v-dialog
            v-model="visible"
            persistent
            fullscreen
            >
        <v-app-bar
            app
            clipped-left
            color="color-gradient"
            class="text-center"
            >
            <h3>About Bridge Passport Mobile</h3>
            <v-spacer></v-spacer>
            <v-icon @click="close">mdi-close</v-icon>
         </v-app-bar>
        <v-card style="position:absolute; top:60px;">
            <v-card-text class="inverted text-left">
                <v-subheader class="pl-0 ml-0 mt-n2">Version Info</v-subheader>
                <v-divider class="mt-n1 mb-1"></v-divider>
                <p>
                    {{version}}
                </p>
                <v-subheader class="pl-0 ml-0 mt-n2">License</v-subheader>
                <v-divider class="mt-n1 mb-1"></v-divider>
                <p>
                    This software is licensed under the Apache 2.0 License and is being provided to you on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  Bridge Protocol Corporation will not be held liable for any loss or damages resulting from the use of this software.  If you do not agree with these terms, you must stop using this software immediately.  Please review the <a @click="openUrl('https://docs.bridgeprotocol.io/docs/license')">Bridge Network terms of service</a> and <a @click="openUrl('https:/docs.bridgeprotocol.io/docs/tos')">open source license</a> before using this software.
                </p>
                <v-subheader class="pl-0 ml-0 mt-n2">Limitation of Liability</v-subheader>
                <v-divider class="mt-n1 mb-1"></v-divider>
                <p>
                    It is your responsibility to ensure that you backup your passport and associated blockchain wallet private keys.  Bridge Protocol Corporation will not be held responsible for loss of funds, verified claims data, or any other damages resulting from the use of this software.
                </p>
                <v-subheader class="pl-0 ml-0 mt-n2">Assignment of Copyright</v-subheader>
                <v-divider class="mt-n1 mb-1"></v-divider>
                <p>
                    This software, "Bridge" Logo, and any other related content are Copyright ©2018-<span>{{currentYear}}</span> Bridge Protocol Corporation, All Rights Reserved.  Some portions of this software and logos are copyright to their respective owners.
                </p>
                <div class="text-center">
                    <v-btn
                        @click="close"
                    >
                        Close
                    </v-btn>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    data: function() {
        return {
            visible: true,
            currentYear: new Date().getFullYear(),
            version: "1.0.0"
        }
    },
    methods:{
        openUrl(url){
            window.open(url);
        },
        close(){
            this.$router.push({ path: '/home', query: { } });
            this.$router.go(1);
        }
    }
}
</script>