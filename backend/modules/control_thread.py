import json
import sys
import time
from threading import Thread

from modules.data import variables


class ControlSystemsThread(Thread):
    def run(self):
        variables.log2(self.__class__.__name__, "running")
        t0 = time.time()
        t0_spab = t0
        t0_ramp = t0
        t0_step = t0
        t0_control = t0

        controller_type=1
        # if appVariables.appConfig['controller_class'] == 'pi':
        #     controller_type = 1
        #
        # elif appVariables.appConfig['controller_class'] == 'pid':
        #     controller_type=2

        Kp=0
        Ki=0
        Kd=0
        Tf=0
        ctrl_id_prev=-1
        yk=0
        ek=0

        while True:
            time.sleep(0.01)
            t1=time.time()
            if 'value2' in variables.sensor_data[variables.app_config['y_index']]:
                variables.app_flags['yk'] = variables.sensor_data[variables.app_config['y_index']]['value2']
                variables.app_flags['ek'] = variables.app_flags['ref'] - variables.app_flags['yk']
                yk = variables.app_flags['yk']
                ek = variables.app_flags['ek']

            uk = variables.app_flags["pump"]

            if (t1 - t0_control) >= variables.app_config['ts_control']:
                t0_control = t1
                # multi model control evaluation
                best_model_id = 0
                min_err = 100000
                Ts = variables.app_config['ts_control']
                # calculate model outputs
                sum_error = 0
                sum_error_norm = 0
                uk_multi = 0
                for i in range(len(variables.app_config['models'])):
                    model = variables.app_config['models'][i]
                    yk1_m = variables.app_flags["models"][i]['yk']
                    # the characteristic has insensitive zone
                    # uk_model = uk - model['u_min']

                    uk_model = uk
                    if uk_model < 0:
                        uk_model = 0
                    yk_m = yk1_m * model['den'][1] + uk_model * model['num'][0]
                    variables.app_flags["models"][i]['yk'] = yk_m
                    ek_m = yk - yk_m
                    variables.app_flags["models"][i]['ek'] = ek_m
                    if abs(ek_m) < min_err:
                        min_err = abs(ek_m)
                        best_model_id = i

                if min_err != 0:
                    for i in range(len(variables.app_config['models'])):
                        model_ek = variables.app_flags["models"][i]['ek']
                        if model_ek == 0:
                            model_ek = 0.01
                        variables.app_flags["models"][i]['ek_norm'] = 1 / (abs(model_ek) / min_err)
                        sum_error_norm += abs(variables.app_flags["models"][i]['ek_norm'])
                # calculate controller outputs
                for i in range(len(variables.app_config['controllers'])):
                    controller_data = variables.app_config['controllers'][i]
                    Kp = variables.app_config['controllers'][i]['kp']
                    Ki = variables.app_config['controllers'][i]['ki']

                    integral = variables.app_flags['controllers'][i]['integral']
                    integral += ek * Ts * Ki
                    if (integral > 255):
                        integral = 255
                    if (integral < 0):
                        integral = 0

                    variables.app_flags['controllers'][i]['uk'] = ek * Kp + integral
                    variables.app_flags['controllers'][i]['integral'] = integral

                if sum_error_norm != 0:
                    for i in range(len(variables.app_config['controllers'])):
                        variables.app_flags['controllers'][i]['a'] = variables.app_flags["models"][i]['ek_norm'] / sum_error_norm
                        # blend controller commands for smooth switching between controllers
                        uk_multi += variables.app_flags['controllers'][i]['a'] * variables.app_flags['controllers'][i][
                            'uk']

                # auto modes
                # check modes
                if variables.app_flags["mode"] == 1 or variables.app_flags["mode"] == 5:
                    # auto mode
                    variables.app_flags['control_time'] = t1
                    if variables.app_flags["mode"] == 5:
                        if (t1 - t0_step) >= variables.app_config['ts_step']:
                            t0_step = t1
                            if (variables.app_flags["spab_index"] < len(
                                    variables.app_config['ref_step_sequence'])):
                                variables.app_flags["ref"] = variables.app_config['ref_step_sequence'][
                                    variables.app_flags["spab_index"]]
                                variables.app_flags["spab_index"] += 1
                    ctrl_id = variables.app_flags['controller_id']

                    if variables.app_flags['multi']:
                        # multi model
                        Ts = variables.app_config['ts_control']

                        # show best model with corresponding controller output
                        variables.app_flags['controller_id'] = best_model_id
                        uk = uk_multi
                        # uk = appVariables.appFlags['controllers'][appVariables.appFlags['controller_id']]['uk']

                    else:
                        if controller_type == 1:
                            if ctrl_id != ctrl_id_prev:
                                Kp = variables.app_config['controllers'][ctrl_id]['kp']
                                Ki = variables.app_config['controllers'][ctrl_id]['ki']
                                variables.app_flags['Kp'] = Kp
                                variables.app_flags['Ki'] = Ki
                                variables.app_flags['Kd'] = 0
                                variables.app_flags['Tf'] = 0


                            variables.app_flags['integral'] += ek * Ts * Ki
                            if (variables.app_flags['integral'] > 255):
                                variables.app_flags['integral'] = 255
                            if (variables.app_flags['integral'] < 0):
                                variables.app_flags['integral'] = 0

                            uk = ek * Kp + variables.app_flags['integral']
                        elif controller_type == 2:
                            if ctrl_id != ctrl_id_prev:
                                Kp = variables.app_config['controllers'][ctrl_id]['kp']
                                Ki = variables.app_config['controllers'][ctrl_id]['ki']
                                Kd = variables.app_config['controllers'][ctrl_id]['kd']
                                Tf = variables.app_config['controllers'][ctrl_id]['tf']

                                Ts = variables.app_config['ts_control']

                                variables.app_flags['Kp'] = Kp
                                variables.app_flags['Ki'] = Ki
                                variables.app_flags['Kd'] = Kd
                                variables.app_flags['Tf'] = Tf

                                # K1=Kp+Ki+Kd
                                # K2=-Kp-2*Kd
                                # K3=Kd
                                K1 = Kp + (Ts * Ki) + Kd / Ts
                                K2 = -Kp - 2 * Kd / Ts
                                K3 = Kd / Ts
                                ek1 = 0
                                ek2 = 0
                                uk1 = 0

                            variables.app_flags['integral'] += ek * Ts * Ki
                            if (variables.app_flags['integral'] > 255):
                                variables.app_flags['integral'] = 255
                            if (variables.app_flags['integral'] < 0):
                                variables.app_flags['integral'] = 0
                            derivative = (ek - ek1) / Ts
                            uk = ek * Ki + variables.app_flags['integral'] + derivative * Kd
                            ek1 = ek

                    if (uk > 255):
                        uk = 255
                    if (uk < variables.app_config['u_min']):
                        uk = variables.app_config['u_min']
                    variables.app_flags["pump"] = int(uk)
                    variables.test_manager.set_pump(int(uk))
                    ctrl_id_prev = ctrl_id

            if variables.app_flags["mode"]==2:
                # ident mode / static
                if (t1 - t0_ramp) >= variables.app_config['ts_ramp']:
                    t0_ramp = t1
                    if variables.app_aux_flags["dir_pump"] == 1:
                        if uk <= 255 - variables.app_config['du_ramp']:
                            uk += variables.app_config['du_ramp']
                        else:
                            # appVariables.appFlagsAux["dir_pump"] = 0
                            pass
                    else:
                        if uk >= variables.app_config['du_ramp']:
                            uk -= variables.app_config['du_ramp']
                        else:
                            variables.app_aux_flags["dir_pump"] = 1
                    variables.app_flags["pump"] = int(uk)
                    variables.test_manager.set_pump(int(uk))
            elif variables.app_flags["mode"] == 3:
                # ident mode / step sequence
                if (t1 - t0_step) >= variables.app_config['ts_step']:
                    t0_step = t1
                    if (variables.app_flags["spab_index"] < len(variables.app_config['step_sequence'])):
                        uk = variables.app_config['step_sequence'][variables.app_flags["spab_index"]]
                        variables.app_flags["spab_index"] += 1
                    variables.app_flags["pump"] = int(uk)
                    variables.test_manager.set_pump(int(uk))
            elif variables.app_flags["mode"] == 4:
                # ident mode / spab
                if (t1 - t0_spab) >= variables.app_config['ts_spab']:
                    t0_spab = t1

                    delta = variables.spab_data[variables.app_flags["spab_index"]] * variables.app_config['du_spab']
             
                    variables.app_flags["spab_index"]+=1
                    if variables.app_flags["spab_index"] == len(variables.spab_data):
                        variables.app_flags["spab_index"] = 0
                    uk = variables.app_config['um_spab'] + delta

                    variables.app_flags["pump"] = int(uk)
                    variables.test_manager.set_pump(int(uk))

        variables.log2(self.__class__.__name__, "stopped")